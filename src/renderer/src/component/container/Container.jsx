import React, { useState } from "react";
import "../../css/container/container.css";
import Left from './Left'
import { Tabs, message } from 'antd';
import Tables from './Tables'
import TableQuery from './TableQuery'
import Test from './TableDetailContainer'

export default function App() {
    const [leftWidth, setLeftWidth] = useState("20%");
    const [isDragging, setIsDragging] = useState(false);
    const [items, setItems] = useState([]);
    const [activeKey, setActiveKey] = useState();
    const types = ['tables', 'table-preview', 'table-struct', 'table-create', 'table-update', 'query']

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const containerWidth = e.currentTarget.offsetWidth;
        const dragPercentage = e.clientX / containerWidth;
        if (dragPercentage < 0.50) {
            setLeftWidth(`${dragPercentage * 100}%`);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const clickDatabase = async e => {
        const newTabName = e.name + '_' + e.database + '_tables';
        const targetIndex = items.findIndex((pane) => pane.key === newTabName);
        if (targetIndex > -1) {
            setActiveKey(newTabName);
        } else {
            try {
                //const data = await window.database.showTables(e);
                const obj = [
                    ...items,
                    {
                        label: e.database + '@tables',
                        children: <Tables params={e} handleHeaderButtonClickEvent={handleHeaderButtonClickEvent} />,
                        key: newTabName,
                    },
                ]
                setItems(obj);
                window.constant.setTabs(obj)
                setActiveKey(newTabName);
            } catch (error) {
                message.error(error.message)
            }
        }
    }
    const onChange = (key) => {
        setActiveKey(key);
    };

    const remove = (targetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
        window.constant.setTabs(newPanes)
    };
    const onEdit = (targetKey, action) => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };

    /**
     * 库表列表header点击事件
     */
    const handleHeaderButtonClickEvent = (eventType, tableName, params) => {
        if (!eventType) {
            return
        }
        let newTabName = null;
        let temp = null;
        switch (eventType) {
            case 'query': {
                newTabName = params.name + "_query" + "_" + window.constant.getCounter();
                temp = [
                    ...window.constant.getTabs(),
                    {
                        label: params.name + '@查询',
                        children: <TableQuery params={params} tableName={tableName} database={params.database} />,
                        key: newTabName,
                    },
                ];
            }
                break;
            case 'open': {
                newTabName = params.name + "_query" + "_" + window.constant.getCounter();
                temp = [
                    ...window.constant.getTabs(),
                    {
                        label: params.name + '@' + tableName + '(' + params.database + ')',
                        children: <Test params={params} tableName={tableName} />,
                        key: newTabName,
                    },
                ];

            }
                break;
        }
        if (newTabName && temp) {
            setItems(temp);
            window.constant.setTabs(temp)
            setActiveKey(newTabName);
        }
        window.constant.increatCounter()
    }

    return (
        <div className="container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div className="left" style={{ width: leftWidth }}>
                <Left clickDatabase={clickDatabase} items={items}></Left>
            </div>
            <div className="drag-handle" onMouseDown={handleMouseDown} />
            <div className="right" style={{ width: `calc(100% - ${leftWidth})` }}>
                <Tabs
                    hideAdd
                    onChange={onChange}
                    activeKey={activeKey}
                    type="editable-card"
                    onEdit={onEdit}
                    items={items}
                />
            </div>
        </div >
    );
}
