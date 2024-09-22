// Reviewer.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Button } from 'antd';
import Web3 from 'web3';
import ProductListABI from '../../contract/ABIs/ProductList.json'; // 商品列表合约 ABI
import MerchantListABI from '../../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import MerchantABI from '../../contract/ABIs/Merchant.json'; // 商家合约 ABI

import ProductListAddress from '../../contract/ADDRESSes/ProductListAddress'; // 商品列表合约地址
import MerchantListAddress from '../../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址

import '../../static/css/app.css'; // 导入 CSS 文件

function formatDate(timestamp) {
    if (timestamp) {
        const date = new Date(Number(timestamp) * 1000); // 将BigInt转换为Number后再进行计算
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return '';
}
const ProductList = () => {
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [web3, setWeb3] = useState(null);
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractMerchantList, setcontractMerchantList] = useState(null);
    const [contractMerchant, setcontractMerchant] = useState(null);
    const [isMerchant, setisMerchant] = useState(false);

    const [productList, setproductList] = useState('') //查看所有产品列表
    const [IsList, setIsList] = useState(false);//控制是否显示列表


    const columns = [
        {
            title: 'ID',
            dataIndex: 'Id',
            key: 'Id',
            render: (text) => {
              const newText = text.toString(); // 将文本转换为字符串
              return <span style={{ color: 'black' }}>{newText}</span>;
            },
          },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {text}
                </span>
            )
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {text}
                </span>
            )
        },
        {
            title: '种类',
            dataIndex: 'category',
            key: 'category',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {text}
                </span>
            )
        },
        {
            title: '单价',
            dataIndex: 'price',
            key: 'price',
            render: (text) => (
                <span style={{ color: 'black' }}>{text.toString()}</span>
            ),
        },
        {
            title: '库存数量',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => (
                <span style={{ color: 'black' }}>{text.toString()}</span>
            ),
        },
        {
            title: '商品图片',
            dataIndex: 'imageHash',
            key: 'imageHash',
            render: (text) => (
                <img
                    src={`https://aqua-famous-koala-370.mypinata.cloud/ipfs/${text}`}
                    alt="Product"
                    style={{ width: '100px', height: '100px' }}
                />
            ),
        },
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {formatDate(text)}
                </span>
            )
        },
        {
            title: '是否有效',
            dataIndex: 'isValid',
            key: 'isValid',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {text === true ? '售卖中' : '已下架'}
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (text, product) => (
                <Button type="primary" onClick={() => RemoveProduct(product)} disabled={!product.isValid}>
                    下架
                </Button>
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

                    getAllProducts(web3Instance,productListInstance)
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    // 产品列表
    const getAllProducts = async (web3Instance,productListInstance) => {
        if (productListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const result = await productListInstance.methods.getAllProducts().call({ from: fromAddress });
                setproductList(result);
                setIsList(true);//让列表显示出来
                console.log(result)
                // alert('添加保险产品成功！');
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        };
    };

    // 下架商品
    const RemoveProduct = async (product) => {
        if (contractProductList) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress, "Input:", product);
                const result = await contractProductList.methods.removeProduct(MerchantListAddress, address, product.Id).send({ from: fromAddress });
                alert('下架成功！');
            } catch (error) {
                console.error(error);
                alert('下架失败！');
            }
        };
    };

    return (
        <div>
            {/* 如果当前账户不是商家，则显示提示信息 */}
            {!isMerchant && (<div>您没有权限访问此页面。</div>)}

            {/* 商家界面 */}
            {isMerchant && (
                <div>
                    <h1>商家商品列表</h1>

                    {IsList ? (
                        <Table
                            dataSource={productList}
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
                        <div>No product information available.</div>
                    )}

                </div>
            )}
        </div>
    );
}

export default ProductList;
