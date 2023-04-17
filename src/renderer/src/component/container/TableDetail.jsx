import { Form, Popconfirm, Table, Typography, Input, Button, Space, InputNumber, DatePicker, message, TimePicker, Select } from 'antd';
import { useState } from 'react';
import { LoadingOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { dateFormatTest } from '../utils/DateCommonUtils'
import dayjs from 'dayjs';

const dateFormat = 'YYYY-MM-DD';
const dateUtilsFormat = 'YYYY-mm-dd'
const datetimeUtilsFormat = 'YYYY-mm-dd HH:MM:SS'

let left_str, right_str;
left_str = right_str = ''

function getSpaceStr(columnName, index, type) {
    type = type.toLowerCase();
    let res;
    switch (type) {
        case 'mysql': res = '?'; break;
        case 'postgresql': res = `\$${index}`; break;
        case 'oracle': res = `:${index}`; break;
        case 'sqlserver': res = `@${columnName}`; break;
        default: res = '?'; break;
    }
    return res;
}

function getWhereObj(record, columnTypeMap, count, databaseType) {
    let whereArr = []
    let values = []
    for (const key in record) {
        if (Object.hasOwnProperty.call(record, key) && columnTypeMap.has(key)) {
            if (record[key] === null) {
                whereArr.push(`${left_str}${key}${right_str} IS NULL`)
            } else {
                let seprator = getSpaceStr(key, count, databaseType)
                whereArr.push(`${left_str}${key}${right_str} = ${seprator}`)
                count += 1;

                const type = columnTypeMap.get(key).toLowerCase()
                const element = record[key]
                if (typeof element === 'undefined' || element === null) {
                    values.push(null)
                    continue;
                }
                let res;
                switch (type) {
                    case 'date': res = dayjs(element).format('YYYY-MM-DD'); break
                    case 'datetime':
                    case 'timestamp': res = dayjs(element).format('YYYY-MM-DD HH:mm:ss'); break;
                    case 'time': {
                        if (typeof element === 'string') {
                            res = element;
                        } else {
                            res = dayjs(element).format('HH:mm:ss')
                        }
                    }; break;
                    default: res = element;
                }
                values.push(res)
            }
        }
    }
    return {
        'values': values,
        'whereArr': whereArr
    }
}

const EditableCell = ({
    editing,
    type,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    let inputNode;
    switch (type) {
        case 'long':
        case 'int':
        case 'int4':
        case 'int8': {
            inputNode = <InputNumber />
        } break;
        case 'date': {
            inputNode = <DatePicker />;
        }; break;
        case 'datetime':
        case 'timestamp':
            inputNode = (
                <DatePicker
                    showTime={{
                        defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                    }}
                />
            ); break;
        case 'time': {
            inputNode = (
                <TimePicker />
            )
        }; break;
        default: {
            inputNode = <Input />
        }; break
    }
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};
const App = props => {
    const type = props.params.type.toLowerCase();
    switch (type) {
        case 'mariadb':
        case 'mysql': {
            left_str = '`';
            right_str = '`'
        }; break;
        case 'oracle':
        case 'sqlite':
        case 'postgresql': {
            left_str = '"';
            right_str = '"';
        }; break;
        case 'sqlserver': {
            left_str = '[';
            right_str = ']';
        }; break;
    }

    const [form] = Form.useForm();
    const [data, setData] = useState(props.tableDetail.data);
    const [editingKey, setEditingKey] = useState('');
    const isEditing = (record) => record._______key === editingKey;
    const [result, setResult] = useState("")
    const [running, setRunning] = useState(false)
    const [condition, setCondition] = useState(false)
    const [conditionValue, setConditionValue] = useState("")
    const [limitValue, setLimitValue] = useState(100)
    const columnTypeMap = new Map()
    for (const iterator of props.tableDetail.columns) {
        columnTypeMap.set(iterator.dataIndex, iterator.type)
    }
    const columns = [
        {
            title: 'operation',
            dataIndex: 'operation',
            width: 150,
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link
                            onClick={() => save(record)}
                            style={{
                                marginRight: 8,
                            }}
                        >
                            <CheckOutlined />
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={() => cancel(record)}>
                            <CloseOutlined />
                        </Popconfirm>
                    </span>
                ) : (
                    <span>
                        <Typography.Link
                            style={{
                                marginRight: 8,
                            }}
                            disabled={editingKey !== ''} onClick={() => edit(record)}>
                            <EditOutlined />
                        </Typography.Link>
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record)}>
                            <DeleteOutlined />
                        </Popconfirm>
                    </span>
                );
            },
        },
        ...props.tableDetail.columns
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
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
                case 'time': {
                    if (typeof text === 'string') {
                        res = text
                    } else {
                        res = dayjs(text).format('HH:mm:ss')
                    }
                }; break;
                default: res = text + ""
            }
            return res;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
                type: col.type.toLowerCase()
            }),
        };
    });

    const edit = (record) => {
        let temp = { ...record }
        for (const key in temp) {
            if (Object.hasOwnProperty.call(temp, key) && columnTypeMap.has(key)) {
                const element = temp[key];
                if (typeof element === 'undefined' || element === null) {
                    temp[key] = null;
                    continue;
                }
                const type = columnTypeMap.get(key).toLowerCase()
                let res;
                switch (type) {
                    case 'date': res = dayjs(dateFormatTest(dateUtilsFormat, element), 'YYYY-MM-DD'); break
                    case 'datetime':
                    case 'timestamp': res = dayjs(dateFormatTest(datetimeUtilsFormat, element), 'YYYY-MM-DD HH:mm:ss'); break;
                    case 'time': res = dayjs(element, 'HH:mm:ss'); break;
                    default: res = element;
                }
                temp[key] = res
            }
        }
        form.setFieldsValue(temp);
        setEditingKey(record._______key);
    };
    const cancel = record => {
        setEditingKey('');
        if (record._______commit_none) {
            setData(data.filter(e => e._______key != record._______key));
        }
    };
    const save = async (record) => {
        try {
            const row = await form.validateFields();
            //将row中undefined字段设置为null
            //let temp = { ...row }
            let map = new Map()
            for (const key in row) {
                if (Object.hasOwnProperty.call(row, key) && columnTypeMap.has(key)) {
                    let element = row[key];
                    if (typeof element === 'undefined' || element === null) {
                        row[key] = null;
                        map.set(key, null);
                        continue;
                    }
                    const type = columnTypeMap.get(key).toLowerCase()
                    let res;
                    switch (type) {
                        case 'date': res = dayjs(element).format('YYYY-MM-DD'); break
                        case 'datetime':
                        case 'timestamp': res = dayjs(element).format('YYYY-MM-DD HH:mm:ss'); break;
                        case 'time': res = dayjs(element).format('HH:mm:ss'); break;
                        default: res = element;
                    }
                    map.set(key, res)
                }
            }

            let keys = [];
            let values = []
            let updateArr = []
            let spaceArr = []
            let count = 1;
            for (const iterator of map) {
                keys.push(`${left_str}${iterator[0]}${right_str}`)
                values.push(iterator[1])

                let seprator = getSpaceStr(iterator[0], count, type)
                spaceArr.push(seprator)
                updateArr.push(`${left_str}${iterator[0]}${right_str} = ${seprator}`)
                count += 1;
            }

            let sql;
            if (record._______commit_none) {
                sql = `insert into ${left_str}${props.tableName}${right_str}(${keys.join(',')}) values(${spaceArr.join(',')})`
            } else {
                const resultWhere = getWhereObj(record, columnTypeMap, count, type)
                let whereArr = resultWhere.whereArr
                values = [...values, ...resultWhere.values]

                sql = `update ${left_str}${props.tableName}${right_str} set ${updateArr.join(',')} where ${whereArr.join(' and ')}`
                if (type === 'mysql') {
                    sql += ' limit 1'
                }
            }
            setRunning(true)
            const result = await window.database.executeParams(sql, values, props.params)
            setResult(result)
            const index = data.findIndex((item) => item._______key === record._______key);
            row._______key = record._______key;
            row._______commit_none = false;
            for (const key in row) {
                if (Object.hasOwnProperty.call(row, key)) {
                    const element = row[key];
                    data[index][key] = element
                }
            }
            setData(data);
            setEditingKey('');
        } catch (err) {
            console.log('err:', err);
            message.error(err.message)
        }
        setRunning(false)
        return
    };
    const handleDelete = async row => {
        try {
            const resultWhere = getWhereObj(row, columnTypeMap, 1, type)
            let whereArr = resultWhere.whereArr
            let values = resultWhere.values
            let sql = `delete from ${props.tableName} where ${whereArr.join(' and ')}`
            if (type === 'mysql') {
                sql += ' limit 1'
            }
            setRunning(true)
            const result = await window.database.executeParams(sql, values, props.params)
            setResult(result)
            setData(data.filter(e => e._______key != row._______key));
        } catch (error) {
            console.log(error)
            message.error(error.message)
        } finally {
            setRunning(false)
        }
    }


    function processResult(result) {
        let count = 1
        if (result.data && result.data.length > 0) {
            result.data = result.data.map(e => {
                e._______key = count
                count = count + 1
                return e;
            })
        }
        return result.data;
    }

    const doQuery = async () => {
        try {
            let sql;
            if (conditionValue && conditionValue.trim()) {
                sql = `select * from ${props.tableName} where ${conditionValue}`
            } else {
                sql = `select * from ${props.tableName}`
            }
            if (limitValue !== -1 && limitValue > 0) {
                sql += ' limit ' + limitValue;
            }
            setRunning(true)
            const result = await window.database.fetchData(sql, props.params)
            setData(processResult(result))
        } catch (err) {
            console.log(`query happen error ${err}`)
            message.error(err.message)
        }
        setRunning(false)
    }
    const refresh = async () => {
        try {
            setRunning(true)
            let sql = `select * from ${props.tableName}`
            if (limitValue !== -1 && limitValue > 0) {
                sql += ' limit ' + limitValue;
            }
            const result = await window.database.fetchData(sql, props.params)
            setData(processResult(result))
        } catch (err) {
            console.log(`query happen error ${err}`)
            message.error(err.message)
        }
        setRunning(false)
    }
    const addRow = async () => {
        let addRowData = {}
        for (const iterator of columns) {
            addRowData[iterator.title] = null
        }
        addRowData._______key = crypto.randomUUID()
        addRowData._______commit_none = true
        setData([
            ...data, addRowData
        ])
        setEditingKey(addRowData._______key);
    }
    return (
        <div>
            <div style={{ marginLeft: 5 }}>
                <Space>
                    <Button type='primary' onClick={addRow} disabled={editingKey}>添加数据</Button>
                    <Button type='primary' onClick={refresh}>刷新</Button>
                    <Button type='primary' onClick={e => setCondition(true)}>添加条件</Button>
                    <Select
                        style={{
                            width: 150,
                        }}
                        onChange={e => {
                            setLimitValue(e)
                        }}
                        value={limitValue}
                        options={[
                            {
                                value: '100',
                                label: '100 limit',
                            },
                            {
                                value: '1000',
                                label: '1000 limit',
                            },
                            {
                                value: '10000',
                                label: '10000 limit',
                            },
                            {
                                value: '-1',
                                label: '无 limit',
                            },
                        ]}
                    />
                </Space>
            </div>

            <div style={{ marginLeft: 5, marginTop: 3 }}>
                {condition ? (
                    <Space.Compact block>
                        <Input
                            style={{
                                width: '100%',
                            }}
                            value={conditionValue}
                            onChange={e => setConditionValue(e.target.value)}
                        />
                        <Button type="primary" onClick={doQuery}>查询</Button>
                    </Space.Compact>
                ) : ("")}
            </div>
            <div style={{ marginTop: 5 }}>
                <Form form={form}
                    component={false}

                >
                    <Table
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        bordered
                        dataSource={data}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{
                            onChange: cancel,
                        }}
                        rowKey={e => e._______key}
                    />
                </Form>
            </div>
            <div style={{ marginTop: 20, marginLeft: 5 }}>
                {running ? (<LoadingOutlined />) : (result)}
            </div>
        </div>
    );
};
export default App;