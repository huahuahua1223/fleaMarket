// Admin.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams, Link } from 'react-router-dom';
import '../../static/css/app.css'; // 导入 CSS 文件
import { Card, Typography, Spin, Alert, Table, Button, Select } from 'antd';

import ProductListABI from '../../contract/ABIs/ProductList.json'; // 产品列表合约 ABI
import AdminABI from '../../contract/ABIs/Admin.json'; // 管理员合约 ABI

import ProductListAddress from '../../contract/ADDRESSes/ProductListAddress'; // 产品列表合约地址
import AdminListAddress from '../../contract/ADDRESSes/AdminListAddress'; // 管理员列表合约地址

const { Title, Paragraph } = Typography;
const { Option } = Select;

function formatDate(timestamp) {
    if (timestamp) {
        const date = new Date(Number(timestamp) * 1000); // 将BigInt转换为Number后再进行计算
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return '';
}
const EvaluationReport = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractProductList, setcontractProductList] = useState(null);
    const [contractAdmin, setcontractAdmin] = useState(null);
    const [isAdmin, setisAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [reportList, setReportList] = useState([]) // 查看所有举报列表
    const [isList, setIsList] = useState(false);// 控制是否显示列表

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

                    // 创建管理员合约实例
                    const adminInstance = new web3Instance.eth.Contract(
                        AdminABI,
                        address
                    );
                    setcontractAdmin(adminInstance);

                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取管理员合约的 owner 地址
                    const ownerAddress = await adminInstance.methods.getOwner().call();
                    // 检查当前账户是否是管理员本人
                    setisAdmin(currentAddress === ownerAddress);

                    await GetAllReports(web3Instance, productListInstance)
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    const columns = [
        {
            title: '产品编号',
            dataIndex: 'productId',
            key: 'productId',
            render: (text) => {
              const newText = text.toString(); // 将文本转换为字符串
              return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '举报者',
            dataIndex: 'reporter',
            key: 'reporter',
            render: (text) => {
              const newText = text.toString(); // 将文本转换为字符串
              return <span style={{ color: 'black' }}>{newText}</span>;
            },
        },
        {
            title: '举报原因',
            dataIndex: 'reason',
            key: 'reason',
            render: (text) => {
              return <span style={{ color: 'black' }}>{text}</span>;
            },
        },
        {
            title: '举报时间',
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
            render: (text, report) => (
                <Select defaultValue="是否下架" style={{ width: 120 }} onChange={(value) => doReport(report, value)}>
                    <Option value={true}>同意</Option>
                    <Option value={false}>驳回</Option>
                </Select>
            ),
        }
    ];

    // 评价列表
    const GetAllReports = async (web3Instance,productListInstance) => {
        if (productListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const result = await productListInstance.methods.getAllProductReports().call({ from: fromAddress });
                setReportList(result);
                setIsList(true);//让列表显示出来
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        };
    };

    // 管理员处理举报
    const doReport = async (report, takeAction) => {
        if (contractProductList) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress,"Input:",report.productId,takeAction);
                const result = await contractProductList.methods.evaluationReport(AdminListAddress, address, report.productId,takeAction).send({ from: fromAddress });
                console.log(result)
                alert("处理评价成功")
            } catch (error) {
                console.error(error);
                alert('处理评价失败！');
            }
        };
    };

    return (
        <div style={{ padding: '20px' }}>
            {!isAdmin && !loading && (
                <Alert message="您没有权限访问此页面。" type="error" />
            )}

            {isAdmin && !loading && (
                <div>
                <h1>评价列表</h1>

                {/* 评价列表 */}
                {isList ? (
                    <Table
                        dataSource={reportList}
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
                    <div>No accident information available.</div>
                )}

            </div>
            )}

            {loading && (
                <Spin tip="加载中..." />
            )}
        </div>
    );
}

export default EvaluationReport;
