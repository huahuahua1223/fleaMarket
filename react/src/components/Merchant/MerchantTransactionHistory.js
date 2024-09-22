// GetHistorys.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams } from 'react-router-dom';
import { Table, Input, Button, message, Form, Card, Popover, Rate, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import '../../static/css/app.css'; // 导入 CSS 文件

import ProductListABI from '../../contract/ABIs/ProductList.json'; // 产品列表合约 ABI
import UserListABI from '../../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import UserABI from '../../contract/ABIs/User.json'; // 用户合约 ABI

import ProductListAddress from '../../contract/ADDRESSes/ProductListAddress'; // 产品列表合约地址
import EvaluationListAddress from '../../contract/ADDRESSes/EvaluationListAddress'; // 评价列表合约地址
import UserListAddress from '../../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址

function formatDate(timestamp) {
    if (timestamp) {
        const date = new Date(Number(timestamp) * 1000); // 将BigInt转换为Number后再进行计算
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return '';
}
const MerchantTransactionHistory = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractUserList, setcontractUserList] = useState(null);
    const [contractUser, setcontractUser] = useState(null);
    const [isUser, setisUser] = useState(false);

    const [historyList, setHistoryList] = useState([]) //查看所有历史交易列表
    const [IsList, setIsList] = useState(false);//控制是否显示列表

    // 新增状态，用于控制评价弹窗的显示和存储评价内容
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [popoverVisible, setPopoverVisible] = useState(false);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [imageHash, setImageHash] = useState('');

    const pinataApiKey = 'ab1a2aade4e25af2c766';
    const pinataSecretApiKey = '149cec1c3e77433af6ea3bdc11c3ba5ff0e349ea75d835efe6d476c8ffb88524';

    const columns = [
        {
            title: '用户地址',
            dataIndex: 'user',
            key: 'user',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '商家地址',
            dataIndex: 'merchant',
            key: 'merchant',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '商品编号',
            dataIndex: 'productId',
            key: 'productId',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '购买数量',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '总价格',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '购买时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {formatDate(text)}
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (text, transaction) => (
                <Popover
                    content={renderEvaluationForm(transaction)}
                    title="添加评价"
                    trigger="click"
                    visible={popoverVisible && selectedTransaction === transaction}
                    onVisibleChange={(visible) => setPopoverVisible(visible)}
                >
                    <Button type="primary" onClick={() => handleEvaluationClick(transaction)}>
                        评价
                    </Button>
                </Popover>
            ),
        }
    ];

    useEffect(() => {
        async function init() {
            // 连接到以太坊网络
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    // 请求用户授权
                    await window.ethereum.enable();
                    setWeb3(web3Instance);

                    // 创建产品列表合约实例
                    const productListInstance = new web3Instance.eth.Contract(
                        ProductListABI,
                        ProductListAddress
                    );
                    setcontractProductList(productListInstance);

                    // 创建用户列表合约实例
                    const UserListInstance = new web3Instance.eth.Contract(
                        UserListABI,
                        UserListAddress
                    );
                    setcontractUserList(UserListInstance);

                    // 创建用户合约实例
                    const UserInstance = new web3Instance.eth.Contract(
                        UserABI,
                        address
                    );
                    setcontractUser(UserInstance);

                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取用户合约的 owner 地址
                    const ownerAddress = await UserInstance.methods.getOwner().call();
                    // 检查当前账户是否是用户本人
                    setisUser(currentAddress === ownerAddress);

                    GetTransactionHistory(web3Instance, productListInstance)
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    // 历史交易列表
    const GetTransactionHistory = async (web3Instance,productListInstance) => {
        if (productListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const result = await productListInstance.methods.getTransactionHistory(address).call({ from: fromAddress });
                setHistoryList(result);
                setIsList(true);//让列表显示出来
                console.log(result)
                // alert('添加保险产品成功！');
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        };
    };

    // 店家评价事件
    const handleEvaluationClick = (transaction) => {
        setSelectedTransaction(transaction);
        setPopoverVisible(true);
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
                body: formData
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.statusText}`);
            }

            const data = await res.json();
            const cid = data.IpfsHash;
            setImageHash(cid);
            message.success('图片上传成功！');
        } catch (error) {
            console.error(error);
            message.error('图片上传失败！');
        }
    };

    // 弹框内容
    const renderEvaluationForm = (transaction) => (
        <Form>
            <Form.Item label="评分">
                <Rate
                    value={rating}
                    onChange={(value) => setRating(value)}
                />
            </Form.Item>
            <Form.Item label="内容">
                <Input.TextArea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
            </Form.Item>
            <Form.Item label="图片">
                <Upload
                    customRequest={handleFileUpload}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                </Upload>
            </Form.Item>
            <Form.Item>
                <Button type="primary" onClick={handleEvaluationSubmit}>
                    提交
                </Button>
            </Form.Item>
        </Form>
    );

    // 添加评价
    const handleEvaluationSubmit = async () => {
        if (contractProductList && selectedTransaction) {
            try {
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                await contractProductList.methods.addEvaluation(UserListAddress, EvaluationListAddress, selectedTransaction.productId, rating, comment, imageHash, false).send({ from: fromAddress });
                message.success("添加评价成功");
                setPopoverVisible(false);
                setRating(0);
                setComment('');
                setImageHash('');
            } catch (error) {
                console.error(error);
                message.error("添加评价失败");
            }
        }
    };

    return (
        <div>
            {/* 如果当前账户不是用户，则显示提示信息 */}
            {!isUser && (<div>您没有权限访问此页面。</div>)}

            {/* 用户界面 */}
            {isUser && (
                <div>
                <h1>交易历史</h1>

                {IsList ? (
                    <Table
                        dataSource={historyList}
                        columns={columns} // 确保你已经定义了columns
                        pagination={{
                            pageSize: 2,
                            showTotal: false, // 隐藏总页数
                            showSizeChanger: false, // 隐藏页面大小选择器
                            itemRender: (current, type, originalElement) => {
                                if (type === 'page') {
                                    return (
                                        <span style={{ color: 'black' }}>
                                            {current}
                                        </span>
                                    );
                                }
                                return originalElement;
                            },
                        }}
                    />
                ) : (
                    <div>No history information available.</div>
                )}

            </div>
            )}
        </div>
    );
}

export default MerchantTransactionHistory;
