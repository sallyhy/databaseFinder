import React, { useState } from "react";
import { Select, Space, Button, Input, Table, Spin, message } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { dateFormatTest } from '../utils/DateCommonUtils'
const { TextArea } = Input;
const app = props => {
    const database = props.database;
    const [selectedItem, setSelectedItem] = useState(props.database);
    const tableName = props.tableName;
    const params = props.params
    const [totalDatabases, setTotalDatabases] = useState([])
    const [init, setInit] = useState(false)
    const [textValue, setTextValue] = useState(`select * from ${tableName} limit 10`)
    const [result, setResult] = useState(null)

    const [queryError, setQueryError] = useState(false)
    const [errorMsg, setErrorMsg] = useState(false)
    const [loading, setLoading] = useState(false)

    function handleHeaderSelect(value) {
        setSelectedItem(value)
    }

    if (!init) {
        window.database.showDatabases(params)
            .then(e => {
                if (e && e.length > 0) {
                    const data = e.map(item => {
                        return {
                            value: item,
                            key: item
                        }
                    })
                    setTotalDatabases(data)
                }
            }).catch(e => {
                console.log(e)
                message.error(e.message)
            })
        setInit(true)
    }
    async function querySql() {
        if (!selectedItem || !textValue) {
            return
        }
        params.database = selectedItem;
        setLoading(true)
        window.database
            .executeSql(textValue, params)
            .then(result => {
                if (typeof result === 'string') {
                    setQueryError(true)
                    setErrorMsg(result)
                } else {
                    setQueryError(false)
                    setErrorMsg('')
                    let count = 1
                    if (result.data && result.data.length > 0) {
                        result.data = result.data.map(e => {
                            e._______key = count
                            count = count + 1
                            return e;
                        })
                    }
                    if (result.columns && result.columns.length > 0) {
                        result.columns = result.columns.map((col) => {
                            col.render = text => {
                                let type = col.type;
                                if (!type) {
                                    return text;
                                }
                                type = type.toLowerCase()
                                let res;
                                switch (type) {
                                    case "date": res = dateFormatTest("YYYY-mm-dd", text); break;
                                    case "datetime": res = dateFormatTest("YYYY-mm-dd HH:MM:SS", text); break;
                                    case "timestamp": res = dateFormatTest("YYYY-mm-dd HH:MM:SS", text); break;
                                    default: res = text + ""
                                }
                                return res;
                            }
                            return col;
                        });
                    }
                    setResult(result)
                }
                setLoading(false)
            })
            .catch(err => {
                setQueryError(true)
                setErrorMsg(err.message)
                setResult(null)
                setLoading(false)
                message.error(err.message)
            })
    }
    return (
        <div>
            <div>
                <Space wrap>
                    <Select
                        defaultValue={database}
                        onSelect={handleHeaderSelect}
                        style={{
                            width: 200,
                        }}
                        options={totalDatabases}
                    />
                    <Button type="primary" onClick={querySql}>
                        <CaretRightOutlined /> 运行
                    </Button>
                </Space>
            </div>
            <div style={{ marginTop: 20 }}>
                <div>
                    <TextArea value={textValue} allowClear showCount autoSize onChange={e => setTextValue(e.target.value)} />
                </div>
            </div>
            <div style={{ marginTop: 20 }}>
                {loading ? (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <Spin></Spin>
                    </div>
                ) : queryError ? (
                    <div style={{ marginLeft: 5, marginTop: 20 }}>
                        {errorMsg}
                    </div>
                ) : result ? (
                    <div style={{ marginTop: 20 }}>
                        <Table dataSource={result.data} columns={result.columns} rowKey={e => e._______key} />
                    </div>
                ) : ''}
            </div>
        </div>
    );
}
export default app