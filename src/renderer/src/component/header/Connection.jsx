import { Button, Modal, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { LinkOutlined } from '@ant-design/icons';
import ModelInfo from '../EditConn'

const Connection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {
                isModalOpen ?
                    (
                        <ModelInfo isoOpen={isModalOpen} closeHandle={e => {
                            setIsModalOpen(false)
                        }}></ModelInfo>
                    )
                    :
                    ("")
            }
            <ModelInfo isoOpen={isModalOpen}></ModelInfo>
            <Button
                onClick={e => {
                    setIsModalOpen(true)
                }}
            >
                <LinkOutlined />
                新建连接
            </Button>
        </>
    )
};
export default Connection;