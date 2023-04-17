import { Button, Modal, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const Connection = props => {
    const [isModalOpen, setIsModalOpen] = useState(props.isoOpen);
    const [loading, setLoading] = useState(false);
    const [disable, setDisable] = useState(true);
    const [testLoading, setTestLoading] = useState(false);
    const [form] = Form.useForm();

    let edit = props.edit
    const title = edit ? '编辑连接' : '新建连接'

    useEffect(() => {
        if (edit) {
            form.setFieldsValue(props.data);
        }
    }, [])

    const handleCancel = () => {
        setIsModalOpen(false);
        props.closeHandle()
    };

    const handleTestConn = async data => {
        const values = await form.validateFields()
        try {
            setTestLoading(true)
            await window.database.fetchData('select 1', values)
            setDisable(false)
        } catch (error) {
            console.log(error)
            message.error(error.message)
        }
        setTestLoading(false)
    }

    return (
        <div>
            <Modal title={title} open={isModalOpen} onCancel={handleCancel}
                footer={[
                    <Button type="primary" onClick={async e => {
                        const values = await form.validateFields()
                        setLoading(true)
                        try {
                            if (edit) {
                                window.database.updateConn(values, props.data.name)
                            } else {
                                window.database.addConn(values)
                            }
                            setIsModalOpen(false);
                            props.closeHandle()
                        } catch (error) {
                            console.log(error)
                            message.error(error.message)
                        }
                        setLoading(false)
                    }} loading={loading} disabled={disable}>
                        Submit
                    </Button>,
                    <Button onClick={handleTestConn} loading={testLoading}>
                        Test
                    </Button>,
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>,
                ]}
            >
                <Form
                    {...layout}
                    form={form}
                    name="control-hooks"
                    style={{
                        marginTop: 20
                    }}
                >
                    <Form.Item
                        name="name"
                        label="连接名"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="类 型"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select a type"
                            onChange={() => setDisable(true)}
                            allowClear
                        >
                            <Option value="mysql">MySQL</Option>
                            <Option value="postgresql">PostgreSQL</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="host"
                        label="地址"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input onChange={() => setDisable(true)}/>
                    </Form.Item>
                    <Form.Item
                        name="port"
                        label="端口"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input onChange={() => setDisable(true)}/>
                    </Form.Item>
                    <Form.Item
                        name="user"
                        label="用户"
                    >
                        <Input onChange={() => setDisable(true)}/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密码"
                    >
                        <Input type='password' onChange={() => setDisable(true)}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
};
export default Connection;