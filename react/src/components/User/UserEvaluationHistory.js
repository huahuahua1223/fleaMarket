// GetHistorys.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams } from 'react-router-dom';
import { Table, Input, Button, message, Form, Card, Popover, Rate, Timeline } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import '../../static/css/app.css'; // 导入 CSS 文件

import ProductListABI from '../../contract/ABIs/ProductList.json'; // 产品列表合约 ABI
import EvaluationListABI from '../../contract/ABIs/EvaluationList.json'; // 评价列表合约 ABI
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
const UserEvaluationHistory = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractEvaluationList, setcontractEvaluationList] = useState(null);
    const [contractUserList, setcontractUserList] = useState(null);
    const [contractUser, setcontractUser] = useState(null);
    const [isUser, setisUser] = useState(false);

    const [historyList, setHistoryList] = useState([]) //查看所有历史交易列表
    const [IsList, setIsList] = useState(false);//控制是否显示列表
    const [isReversed, setIsReversed] = useState(true); //控制时间轴顺序

    const columns = [
        {
            title: '商家',
            dataIndex: 'evaluationer',
            key: 'evaluationer',
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
            title: '评分',
            dataIndex: 'rating',
            key: 'rating',
            render: (text) => <Rate disabled value={text} />
        },
        {
            title: '评论',
            dataIndex: 'comment',
            key: 'comment',
            render: (text) => {
                const newText = text.toString(); // 将文本转换为字符串
                return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '图片',
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
            title: '评价时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => (
                <span style={{ color: 'black' }}>
                    {formatDate(text)}
                </span>
            )
        },
        // {
        //     title: '操作',
        //     key: 'action',
        //     render: (text, transaction) => (
        //         <Popover
        //             content={renderEvaluationForm(transaction)}
        //             title="添加评价"
        //             trigger="click"
        //             visible={popoverVisible && selectedTransaction === transaction}
        //             onVisibleChange={(visible) => setPopoverVisible(visible)}
        //         >
        //             <Button type="primary" onClick={() => handleEvaluationClick(transaction)}>
        //                 评价
        //             </Button>
        //         </Popover>
        //     ),
        // }
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

                    // 创建评价列表合约实例
                    const evaluationListInstance = new web3Instance.eth.Contract(
                      EvaluationListABI,
                      EvaluationListAddress
                    );
                    setcontractEvaluationList(evaluationListInstance);
                    
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

                    GetUserEvaluations(web3Instance, evaluationListInstance)
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    // 获取商家给的评价
    const GetUserEvaluations = async (web3Instance,evaluationListInstance) => {
        if (evaluationListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const result = await evaluationListInstance.methods.getUserEvaluations(address).call({ from: fromAddress });
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

    // 颠倒时间轴顺序
    const toggleTimelineOrder = () => {
        setIsReversed(!isReversed);
    };

    return (
        <div>
            {/* 如果当前账户不是用户，则显示提示信息 */}
            {!isUser && (<div>您没有权限访问此页面。</div>)}

            {/* 用户界面 */}
            {isUser && (
                <div>
                <h1>评价列表</h1>
                <Button onClick={toggleTimelineOrder} style={{ marginBottom: '20px' }} icon={isReversed ? <DownOutlined /> : <UpOutlined />}>
                        {isReversed ? '正序' : '倒序'}
                </Button>

                {IsList ? (
                    <Timeline mode="alternate" pending="Recording..." reverse={!isReversed}>
                    {historyList.map((item, index) => (
                        <Timeline.Item key={index}>
                            <p><strong>商家:</strong> {item.evaluationer.toString()}</p>
                            <p><strong>商品编号:</strong> {item.productId.toString()}</p>
                            <p><strong>评分:</strong> <Rate disabled value={parseInt(item.rating)} /></p>
                            <p><strong>评论:</strong> {item.comment.toString()}</p>
                            {item.imageHash && (
                                <p>
                                    <strong>图片:</strong> <br />
                                    <img
                                        src={`https://aqua-famous-koala-370.mypinata.cloud/ipfs/${item.imageHash}`}
                                        alt="Product"
                                        style={{ width: '100px', height: '100px' }}
                                    />
                                </p>
                            )}
                            <p><strong>评价时间:</strong> {formatDate(item.timestamp)}</p>
                        </Timeline.Item>
                    ))}
                </Timeline>
                ) : (
                    <div>No evaluation information available.</div>
                )}

            </div>
            )}
        </div>
    );
}

export default UserEvaluationHistory;
