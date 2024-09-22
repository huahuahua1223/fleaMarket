// Reviewer.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Web3 from 'web3';
import { Input, Button, message, Form, Card, Upload, Progress, Image, Modal, Select } from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';
// import axios from 'axios';
import ProductListABI from '../../contract/ABIs/ProductList.json'; // 商品列表合约 ABI
import MerchantListABI from '../../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import MerchantABI from '../../contract/ABIs/Merchant.json'; // 商家合约 ABI

import ProductListAddress from '../../contract/ADDRESSes/ProductListAddress'; // 商品列表合约地址
import MerchantListAddress from '../../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址

import '../../static/css/app.css'; // 导入 CSS 文件

const { Option } = Select;
const AddProduct = () => {
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [web3, setWeb3] = useState(null);
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractMerchantList, setcontractMerchantList] = useState(null);
    const [contractMerchant, setcontractMerchant] = useState(null);
    const [isMerchant, setisMerchant] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [imageHash, setImageHash] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const pinataApiKey = 'ab1a2aade4e25af2c766';
    //   4a244ab0c5fc8c1edefc
    const pinataSecretApiKey = '149cec1c3e77433af6ea3bdc11c3ba5ff0e349ea75d835efe6d476c8ffb88524';
    // bc35ecdcb8a329c8814c5f7f7b39040a06c753282b893fe32ab93f078b51f8bf

    useEffect(() => {
        async function init() {
            // 连接到以太坊网络
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    // 请求用户授权
                    await window.ethereum.enable();
                    setWeb3(web3Instance);

                    // 创建商品列表合约实例
                    const productListInstance = new web3Instance.eth.Contract(
                        ProductListABI,
                        ProductListAddress
                    );
                    setcontractProductList(productListInstance);

                    // 创建商家合约实例
                    const merchantInstance = new web3Instance.eth.Contract(
                        MerchantABI,
                        address
                    );
                    setcontractMerchant(merchantInstance);

                    // 创建商家列表合约实例
                    const merchantListInstance = new web3Instance.eth.Contract(
                        MerchantListABI,
                        MerchantListAddress
                    );
                    setcontractMerchantList(merchantListInstance);
                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取用户合约的 owner 地址
                    const ownerAddress = await merchantInstance.methods.getOwner().call();
                    // 检查当前账户是否是用户本人
                    setisMerchant(currentAddress === ownerAddress);
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);
    // 发布商品
    const PublishProduct = async () => {
        if (contractProductList) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress, "Input:",name, description,category, price, quantity);
                await contractProductList.methods.publishProduct(MerchantListAddress, address, name, description, category, price, quantity, imageHash).send({ from: fromAddress });
                message.success('发布成功！');
            } catch (error) {
                console.error(error);
                message.error('发布失败！');
            }
        };
    };

    // 上传IPFS
    const handleFileUpload = async ({ file }) => {
        console.log("file:",file)
        const formData = new FormData();
        formData.append('file', file);
        // Log the FormData content
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        // console.log("formData:",formData)

        try {
            const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey
                },
                body: formData,
                onUploadProgress: progressEvent => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress(progress);
                }
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.statusText}`);
            }

            const data = await res.json();
            const cid = data.IpfsHash;
            setImageHash(cid);
            setImageUrl(`https://aqua-famous-koala-370.mypinata.cloud/ipfs/${cid}`);
            message.success('图片上传成功！');
            setUploadProgress(0); // 上传成功后重置进度条
        } catch (error) {
            console.error(error);
            message.error('图片上传失败！');
            setUploadProgress(0);
        }
    };

    // 处理预览图片点击事件
    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onloadend = () => {
                    resolve(reader.result);
                };
            });
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    // 关闭预览图片对话框
    const handleCancel = () => setPreviewVisible(false);

    const handleChangeCategory = value => {
        setCategory(value);
    };

    return (
        <div>
            {/* 如果当前账户不是商家，则显示提示信息 */}
            {!isMerchant && (<div>您没有权限访问此页面。</div>)}

            {/* 商家界面 */}
            {isMerchant && (

                <Card
                    title="发布商品"
                    bordered={false}
                    style={{ maxWidth: 600, margin: '0 auto', marginTop: '20px' }}
                >
                    <Form layout="vertical">
                        <Form.Item label="商品名称">
                            <Input
                                placeholder="商品名称"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="描述">
                            <Input
                                placeholder="描述"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="种类">
                            {/* <Input
                                placeholder="种类"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            /> */}
                            <Select
                                placeholder="请选择种类"
                                onChange={handleChangeCategory}
                                value={category}
                            >
                                <Option value="数码">数码</Option>
                                <Option value="家居生活">家居生活</Option>
                                <Option value="服饰鞋帽">服饰鞋帽</Option>
                                <Option value="食品生鲜">食品生鲜</Option>
                                <Option value="游戏装备">游戏装备</Option>
                                <Option value="图书音像">图书音像</Option>
                                <Option value="租房">租房</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="单价">
                            <Input
                                placeholder="单价"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="数量">
                            <Input
                                placeholder="数量"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="商品图片">
                        <Upload
                                customRequest={handleFileUpload}
                                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                                onPreview={handlePreview}
                            >
                                <Button icon={<UploadOutlined />}>点击上传</Button>
                            </Upload>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <Progress percent={uploadProgress} status="active" />
                            )}
                            {imageUrl && (
                                <Image src={imageUrl} alt="上传的图片" style={{ marginTop: '10px', maxWidth: '100%' }} />
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={PublishProduct}
                                style={{ width: '100%' }}
                            >
                                添加
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            )}
            {/* 图片预览对话框 */}
            <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
                <img alt="上传的图片" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
}

export default AddProduct;
