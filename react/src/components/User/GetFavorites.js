// ProductList.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Table, Button, Card, Pagination, Input, Switch } from 'antd';
import '../../static/css/app.css'; // 导入 CSS 文件

import ProductListABI from '../../contract/ABIs/ProductList.json'; // 产品列表合约 ABI
import UserListABI from '../../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import MerchantListABI from '../../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import UserABI from '../../contract/ABIs/User.json'; // 用户合约 ABI
import MerchantABI from '../../contract/ABIs/Merchant.json'; // 商家合约 ABI

import ProductListAddress from '../../contract/ADDRESSes/ProductListAddress'; // 产品列表合约地址
import UserListAddress from '../../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址
import MerchantListAddress from '../../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址

function formatDate(timestamp) {
    if (timestamp) {
        const date = new Date(Number(timestamp) * 1000); // 将BigInt转换为Number后再进行计算
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return '';
}

const pageSize = 5;
const ProductList = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractUserList, setcontractUserList] = useState(null);
    const [contractUser, setcontractUser] = useState(null);
    const [contractMerchantList, setcontractMerchantList] = useState(null);
    const [contractMerchant, setcontractMerchant] = useState(null);
    const [isUser, setisUser] = useState(false);

    const [productList, setproductList] = useState([]) // 查看所有产品列表
    const [isList, setIsList] = useState(false);// 控制是否显示产品列表
    const [currentPage, setCurrentPage] = useState(1); // 当前页数
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
    const [totalProducts, setTotalProducts] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null); // 选定的产品
    const [loading, setLoading] = useState(true);
    const onChange = (checked) => {
        setLoading(!checked);
    };

    const navigate = useNavigate();

    // 搜索字段改变时直接搜索
    useEffect(() => {
        // 搜索产品列表
        getAllProducts(web3, contractProductList, currentPage, searchKeyword);
    }, [searchKeyword]);

    // 在跳转到商品详情页
    useEffect(() => {
        if (selectedProduct) {
            navigate(`/user/${address}/product/${selectedProduct.Id}`);
        }
    }, [selectedProduct, navigate]);

    // 初始化合约
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

                    // 创建商家列表合约实例
                    const merchantListInstance = new web3Instance.eth.Contract(
                        MerchantListABI,
                        MerchantListAddress
                    );
                    setcontractMerchantList(merchantListInstance);

                    const merchantAddress = await merchantListInstance.methods.getMerchantList().call();
                    
                    // 创建商家合约实例
                    const merchantInstance = new web3Instance.eth.Contract(
                        MerchantABI,
                        merchantAddress[0]
                    );
                    setcontractMerchant(merchantInstance);

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

                    await getAllProducts(web3Instance, productListInstance)
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    // 分页搜索产品列表
    const getAllProducts = async (web3Instance, productListInstance, page = 1, keyword = '') => {
        if (productListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                const result = await productListInstance.methods.getUserFavorites().call({ from: fromAddress });
                // 过滤出有效的产品
                const validProducts = result.filter(product => product.isValid);
                // 进行搜索过滤
                const filteredProducts = validProducts.filter(product => 
                    product.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    product.category.toLowerCase().includes(keyword.toLowerCase())
                );
                // 计算分页起始索引和结束索引
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
                setproductList(paginatedProducts);
                setIsList(true); // 让列表显示出来
                setTotalProducts(filteredProducts.length); // 设置总产品数
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        }
    };

    // 分页
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllProducts(web3, contractProductList, page, searchKeyword);
    };

    // 搜索
    const handleSearch = () => {
        getAllProducts(web3, contractProductList, currentPage, searchKeyword);
    };
    
    // 详情
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };
    

    return (
        <div style={{ padding: '20px'}}>
            {/* 如果当前账户不是用户，则显示提示信息 */}
            {!isUser && (<div>您没有权限访问此页面。</div>)}

            {/* 用户界面 */}
            {isUser && (
                <div>
                    <h1>收藏夹</h1>

                    {/* 搜索框 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, marginRight: 400 }}>
                        <Input.Search
                            placeholder="商品或种类"
                            style={{ width: 400 }}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* 产品列表 */}
                    {isList ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <Switch checked={!loading} onChange={onChange} />
                            {productList.map(product => (
                                <>
                                <Card
                                    hoverable
                                    loading={loading}
                                    key={product.Id}
                                    style={{ width: 200, margin: 10 }}
                                    cover={<img alt="Product" src={`https://aqua-famous-koala-370.mypinata.cloud/ipfs/${product.imageHash}`} />}
                                    onClick={() => handleProductClick(product)} // 添加点击事件处理函数
                                >
                                    <h2>{product.name}</h2>
                                    {/* <p>描述: {product.description}</p> */}
                                    {/* <p>种类: {product.category}</p> */}
                                    <p>单价: {product.price.toString()}</p>
                                    {/* <p>库存数量: {product.quantity.toString()}</p> */}
                                    {/* <p>时间: {formatDate(product.timestamp)}</p> */}
                                </Card>
                                </>
                            ))}
                        </div>
                        
                    ) : (
                        <div>No product information available.</div>
                    )}

                    {/* 分页器 */}
                    {totalProducts > pageSize && (
                        <Pagination
                            current={currentPage}
                            total={totalProducts}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                        />
                    )}

                </div>
            )}
        </div>
    );
}


export default ProductList;
