import { DownOutlined, DatabaseOutlined, ForkOutlined, LinkOutlined } from '@ant-design/icons';
import { Spin, message, Menu, Tree, Dropdown, Button } from 'antd';
import { useEffect, useState } from 'react';
import ModelInfo from '../EditConn'

let data = [];

async function initData() {
    const conns = await window.database.fetchTotalConns()
    if (conns && conns.length > 0) {
        data = conns.map(e => {
            return {
                ...e,
                title: e.name,
                key: e.name,
                icon: <ForkOutlined />
            };
        })
    }
}

const updateTreeData = (list, key, children) => {
    return list.map((node) => {
        if (node.key === key) {
            return {
                ...node,
                children,
            };
        }
        if (node.children) {
            return {
                ...node,
                children: updateTreeData(node.children, key, children),
            };
        }
        return node;
    });
}
const App = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [inited, setInited] = useState();
    const [treeData, setTreeData] = useState(null);
    const [loadingKeys, setLoadingKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editNode, setEditNode] = useState(null)

    function init() {
        if (inited) {
            return
        }
        initData().then(e => {
            setTreeData(data)
            setIsLoading(false)
            setInited(true)
        }).catch(e => {
            console.log(e)
            message.error(e.message)
            setIsLoading(false)
            setInited(true)
        })
        setInited(true)
    }
    init()
    const handleExpand = (expandedKeys) => {
        // 更新已展开的节点
        setExpandedKeys(expandedKeys);
    };
    const onLoadData = async (node) => {
        return new Promise((resolve) => {
            if (node.children) {
                resolve();
                return;
            }
            setLoadingKeys([...loadingKeys, node.key]);
            window.database.showDatabases(node)
                .then(e => {
                    if (e && e.length > 0) {
                        const databases = e.map(item => {
                            return {
                                title: item,
                                key: node.key + "_" + item,
                                icon: <DatabaseOutlined />,
                                isLeaf: true,
                                parent: node
                            }
                        })
                        setTreeData((origin) =>
                            updateTreeData(origin, node.key, databases)
                        );
                    }
                    setLoadingKeys(loadingKeys.filter((key) => key !== node.key));
                }).catch(e => {
                    console.log(e)
                    message.error(e.message)
                    setLoadingKeys(loadingKeys.filter((key) => key !== node.key));
                })
            resolve();
        });
    };
    const processTreeClick = (event, node) => {
        if (node.parent) {
            const params = { ...node.parent, database: node.title };
            props.clickDatabase(params)
        }
    }

    const refreshNode = async (node) => {
        // let dataIrtem = await window.database.showDatabases(node);
        // const databases = dataIrtem.map(item => {
        //     return {
        //         title: item,
        //         key: node.key + "_" + item,
        //         icon: <DatabaseOutlined />,
        //         isLeaf: true,
        //         parent: node
        //     }
        // })
        // node.children = databases
        setInited(false)
        setLoadingKeys([])
        setExpandedKeys(expandedKeys.filter(e => e !== node.key))
    }
    return (<div>
        {
            isCreateModalOpen ?
                (
                    <ModelInfo isoOpen={isCreateModalOpen} closeHandle={e => {
                        setIsCreateModalOpen(false)
                        setInited(false)
                        setLoadingKeys([])
                    }}></ModelInfo>
                )
                :
                ("")
        }
        <div style={{ marginBottom: 20 }}>
            <Button
                onClick={e => {
                    setIsCreateModalOpen(true)
                }}
            >
                <LinkOutlined />
                新建连接
            </Button>
        </div>

        {
            isModalOpen ?
                (
                    <ModelInfo edit='true' data={editNode} isoOpen={isModalOpen} closeHandle={e => {
                        setIsModalOpen(false)
                        setInited(false)
                        // init()
                    }}></ModelInfo>
                )
                :
                ("")
        }

        {
            isLoading ?
                (
                    <div style={{ textAlign: 'center' }}>
                        <Spin />
                    </div>
                ) :
                (
                    <Tree
                        showIcon
                        switcherIcon={<DownOutlined />}
                        treeData={treeData}
                        onClick={processTreeClick}
                        loadData={onLoadData}
                        expandedKeys={expandedKeys}
                        onExpand={handleExpand}
                        loadedKeys={loadingKeys}
                        titleRender={node => {
                            const menu = (
                                <Menu onClick={async e => {
                                    let keyType = e.key
                                    if (keyType === 'refresh') {
                                        refreshNode(node)
                                    } else if (keyType === 'delete') {
                                        await window.database.deleteConn(node.name)
                                        setTreeData(treeData.filter(e => e.key !== node.key))
                                    } else if (keyType === 'edit') {
                                        setEditNode(node)
                                        setIsModalOpen(true)
                                    }
                                }}>
                                    <Menu.Item key="edit">Edit</Menu.Item>
                                    <Menu.Item key="delete">Delete</Menu.Item>
                                    <Menu.Item key="refresh">Refesh</Menu.Item>
                                </Menu>
                            );
                            return (
                                <Dropdown overlay={menu} trigger={['contextMenu']}>
                                    <span>{node.title}</span>
                                </Dropdown>
                            );
                        }
                        }
                    />)
        }
        {loadingKeys.length > 0 && (
            <div style={{ textAlign: 'center' }}>
                <Spin />
            </div>
        )}
    </div>)
};
export default App;