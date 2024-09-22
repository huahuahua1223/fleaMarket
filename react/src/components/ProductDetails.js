import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Descriptions, Button, InputNumber, message, Popover, Input, notification } from 'antd'; // 导入 Ant Design 组件
import { StarOutlined, StarFilled } from '@ant-design/icons'; // 导入星星图标
import ProductListABI from '../contract/ABIs/ProductList.json'; // 产品列表合约 ABI
import UserListABI from '../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import UserABI from '../contract/ABIs/User.json'; // 用户合约 ABI

import ProductListAddress from '../contract/ADDRESSes/ProductListAddress'; // 产品列表合约地址
import EvaluationListAddress from '../contract/ADDRESSes/EvaluationListAddress'; // 评价列表合约地址
import UserListAddress from '../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址

function formatDate(timestamp) {
    if (timestamp) {
        const date = new Date(Number(timestamp) * 1000); // 将BigInt转换为Number后再进行计算
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return '';
}
const ProductDetails = () => {
    const { address, productId } = useParams(); // 从路由参数中获取 productId
    const [web3, setWeb3] = useState(null);
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractUserList, setcontractUserList] = useState(null);
    const [contractUser, setcontractUser] = useState(null);
    const [isUser, setisUser] = useState(false);

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false); // 收藏状态
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');


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

                    await GetProductById(web3Instance, productListInstance)
                    await checkIfFavorite(web3Instance, productListInstance);
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [productId]);
    // 根据id获取详情信息
    const GetProductById = async (web3Instance, productListInstance) => {
        if (productListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                const result = await productListInstance.methods.getProductById(productId).call({ from: fromAddress });
                console.log(result)
                setProduct(result)
            } catch (error) {
                console.error('Error fetching product details:', error);
                // alert("获取失败")
            }
        }
    };

    // 购买产品
    const PurchaseProduct = async () => {
        if (!product) return;
        try {
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0];

            // 购买逻辑调用合约的购买方法
            await contractProductList.methods.purchaseProduct(EvaluationListAddress,UserListAddress,address,productId,quantity).send({from: fromAddress});

            message.success('购买成功！');
        } catch (error) {
            console.error('购买失败:', error);
            message.error('购买失败，请重试。');
        }
    };

    // 检查是否收藏
    const checkIfFavorite = async (web3Instance, productListInstance) => {
        try {
            const accounts = await web3Instance.eth.getAccounts();
            const fromAddress = accounts[0];
            const favorites = await productListInstance.methods.getUserFavorites().call({ from: fromAddress });
            const isFav = favorites.some(favorite => Number(favorite.Id) === Number(productId));
            setIsFavorite(isFav);
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    };

    // 收藏产品
    const FavoriteProduct = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0];

            // 收藏和取消收藏逻辑
            if (isFavorite) {
                await contractProductList.methods.removeFavorite(productId).send({ from: fromAddress });
                message.success('已取消收藏');
            } else {
                await contractProductList.methods.addFavorite(productId).send({ from: fromAddress });
                message.success('已收藏');
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('收藏失败:', error);
            message.error('收藏失败，请重试。');
        }
        
    };

    // 举报产品
    const ReportProduct = async () => {
        if (!reportReason) {
            message.error('请输入举报理由');
            return;
        }
        try {
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0];
            await contractProductList.methods.reportProduct(productId, reportReason).send({ from: fromAddress });
            message.success('举报成功！');
            setReportReason(''); // 清空输入框
        } catch (error) {
            console.error('举报失败:', error);
            message.error('举报失败，请重试。');
        }
    };

    // 弹出举报表单的通知
    // const openNotification = () => {
    //     const key = `open${Date.now()}`;
    //     const btn = (
    //         <Button type="primary" onClick={() => {
    //             notification.close(key);
    //             // 提交举报逻辑
    //             ReportProduct();
    //         }}>
    //             提交举报
    //         </Button>
    //     );
    //     notification.open({
    //         message: '举报产品',
    //         description: (
    //             <Input.TextArea
    //                 rows={4}
    //                 value={reportReason}
    //                 onChange={(e) => setReportReason(e.target.value)}
    //                 placeholder="请输入举报理由"
    //                 style={{ marginBottom: '10px' }}
    //             />
    //         ),
    //         btn,
    //         key,
    //     });
    // };

    // Popover内容
    const popoverContent = (
        <div>
            <Input.TextArea
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="请输入举报理由"
                style={{ marginBottom: '10px' }}
            />
            <Button type="default" onClick={ReportProduct}>
                提交
            </Button>
        </div>
    );
    

    if (!product) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: 'auto' }}>
            {/* 如果当前账户不是用户，则显示提示信息 */}
            {!isUser && (<div>您没有权限访问此页面。</div>)}

            {/* 用户界面 */}
            {isUser && (
                <Row justify="center" style={{ padding: '40px' }}>
                    <Col xs={24} sm={24} md={22} lg={20} xl={18}>
                        <Button type="primary" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                            返回
                        </Button>
                        
                        <Descriptions bordered column={1} style={{ marginBottom: '20px' }}>
                            <Descriptions.Item label="商家地址">{product.merchant}</Descriptions.Item>
                        </Descriptions>
                        <Card title="产品详情" style={{ transform: 'scale(1.1)', transformOrigin: 'top left' }}>
                            <Row gutter={24}>
                                <Col xs={24} sm={12}>
                                    <img
                                        alt="Product"
                                        src={`https://aqua-famous-koala-370.mypinata.cloud/ipfs/${product.imageHash}`}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Descriptions bordered column={1}>
                                        <Descriptions.Item label="名称">{product.name}</Descriptions.Item>
                                        <Descriptions.Item label="描述">{product.description}</Descriptions.Item>
                                        <Descriptions.Item label="种类">{product.category}</Descriptions.Item>
                                        <Descriptions.Item label="价格">{product.price.toString()}</Descriptions.Item>
                                        <Descriptions.Item label="库存">{product.quantity.toString()}</Descriptions.Item>
                                        <Descriptions.Item label="上架日期">{formatDate(product.timestamp)}</Descriptions.Item>
                                    </Descriptions>
                                    <div style={{ marginTop: '20px' }}>
                                        <span>选择数量: </span>
                                        <InputNumber
                                            min={1}
                                            max={Number(product.quantity)}
                                            defaultValue={1}
                                            onChange={(value) => setQuantity(value)}
                                        />
                                    </div>
                                    <Button type="primary" onClick={PurchaseProduct} style={{ marginTop: '20px' }}>
                                        立即购买
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={isFavorite ? <StarFilled /> : <StarOutlined />}
                                        onClick={FavoriteProduct}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {isFavorite ? '已收藏' : '收藏'}
                                    </Button>
                                    {/* 在按钮中调用 openNotification 函数 */}
                                    {/* <Button type="primary" danger onClick={openNotification} style={{ marginBottom: '20px', marginLeft: '10px' }}>
                                        举报
                                    </Button> */}
                                    {/* 在按钮中使用 Popover */}
                                    <Popover content={popoverContent} title="举报产品" trigger="click">
                                        <Button type="primary" danger style={{ marginBottom: '20px', marginLeft: '10px' }}>
                                            举报
                                        </Button>
                                    </Popover>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default ProductDetails;
