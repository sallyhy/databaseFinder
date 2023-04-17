import { Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import TableDetailApp from './TableDetail'
// import TableDetailTest from './TableDetailCp'


const App = props => {
    const params = props.params
    const tableName = props.tableName
    const [tableDetail, setTableDetail] = useState()
    const [loading, setLoading] = useState(false)
    const [queryError, setQueryError] = useState(false)
    const [errorMsg, setErrorMsg] = useState(false)
    function init() {
        if (!loading) {
            window.database
                .fetchData(`select * from ${tableName} limit 100`, params)
                .then(result => {
                    let count = 1
                    if (result.data && result.data.length > 0) {
                        result.data = result.data.map(e => {
                            e._______key = count
                            count = count + 1
                            return e;
                        })
                    }
                    if (result.columns) {
                        result.columns = result.columns.map(e => {
                            e.editable = true
                            return e;
                        })
                    }
                    setTableDetail(result);
                    setQueryError(false)
                    setErrorMsg('')
                    setLoading(true)

                })
                .catch(err => {
                    setQueryError(true)
                    setErrorMsg(err.message)
                    setTableDetail(null)
                    message.error(err.message)
                    setLoading(true)
                })
        }
    }
    useEffect(() => {
        init()
    })

    return (
        <div>
            <div style={{ marginTop: 2 }}>
                {!loading ? (
                    <div style={{ marginTop: 2, textAlign: 'center' }}>
                        <Spin></Spin>
                    </div>
                ) : queryError ? (
                    <div style={{ marginLeft: 5, marginTop: 20 }}>
                        {errorMsg}
                    </div>
                ) : tableDetail ? (
                    <div style={{ marginTop: 2 }}>
                        <TableDetailApp tableDetail={tableDetail} tableName={props.tableName} params={props.params}></TableDetailApp>
                    </div>
                ) : ''}
            </div>
        </div>
    );
};
export default App;