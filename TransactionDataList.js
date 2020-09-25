import React, { PureComponent ,useState} from 'react'
import {Table,Button,Row, Col,Modal} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import {arrayMove} from '../../utils/ArrayUtils'
import moment from 'moment'
import TransactionDetails from './TransactionDetails'
import { checkPropTypes } from 'prop-types'

const VisibleHeaderList = SortableContainer(({ items,handleClickToSort }) => {
    return (
      <tr as="ul">
        {items.map((item, index) => (
          <SortableItem key={`item-${index}`} index={index} item={item} handleClickToSort={handleClickToSort}/>
        ))}
      </tr>
    );
  });
  const SortableItem = SortableElement(({ item,handleClickToSort }) => {
    const [hovered,setHovered] = useState(false);
    const toggleHover = () => setHovered(!hovered);

    const [sortDirection,setSortDirection] = useState(false);
    const changeSortDirection = () => setSortDirection(!sortDirection);
    return (
      <th as="li" style={{ zIndex: 9999, userSelect: 'none' ,whiteSpace:'nowrap',backgroundColor:hovered?'#cce5ff' :''}}  onClick={()=>{handleClickToSort(item.title,sortDirection);changeSortDirection();}} onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}>
        {item.title} &uarr;&darr;
      </th>
    );
  });
export default class TransactionDataList extends PureComponent {
    constructor(props){
        super(props);
        const visibleColumns = [];
        {/* Although the column is in visible column, but the table list will not show the column if all the columns' data are null */}
        props.visibleColumns.map((title)=>{
            props.data.some((item)=>{
                if(item[title] !== null && typeof(item[title]) !== 'undefined'){
                    visibleColumns.push({title:title,value:'&nbsp;',visibility:'hidden'});
                    return true;
                }
            })
        })
		this.state = {
            selectedIndex:-1,
            visibleColumns:visibleColumns,
            filterColumnsContainer:[],
            data:props.data,
            modalVoidVisible:false,
            selectedTransactionId:0,
            openTransactionDetail:{
                show:false,
                width:'96%',
                display:'none',
                arrow:'<<'
            }
        }
        this.handleOneClickOnRow = this.handleOneClickOnRow.bind(this);
        this.handleDoubleClickOnRow = this.handleDoubleClickOnRow.bind(this);
        this.handleSortSelectedHeader = this.handleSortSelectedHeader.bind(this);
        this.cancelFilterColumns = this.cancelFilterColumns.bind(this);
        this.handleFormat = this.handleFormat.bind(this);
        this.handleClickOnVoidButton = this.handleClickOnVoidButton.bind(this);
        this.handleClickToCancelVoidModal = this.handleClickToCancelVoidModal.bind(this);
        this.handleSubmitVoidAction = this.handleSubmitVoidAction.bind(this);
        this.handleClickOnTransactionDetailsButton = this.handleClickOnTransactionDetailsButton.bind(this);
        this.columnCompare = this.columnCompare.bind(this);
        this.handleClickToSort = this.handleClickToSort.bind(this);
	}
    handleClickOnTransactionDetailsButton(){
        let openTransactionDetail = {};
        if(this.state.openTransactionDetail.show){
            openTransactionDetail = {
                show:false,
                width:'96%',
                display:'none',
                arrow:'<<'
            }
        }else{
            openTransactionDetail = {
                show:true,
                width:'70%',
                display:'',
                arrow:'>>'
            }
        }
        this.setState({
            openTransactionDetail
        })
    }
    handleOneClickOnRow(index){
        this.setState({selectedIndex:index});
    }
    handleDoubleClickOnRow(columnKey,columnValue,index){
        const filterColumnsContainer = this.state.filterColumnsContainer;
        const visibleColumns = this.state.visibleColumns.map((item)=>{
            if(item.title === columnKey && item.visibility !== 'visible'){
                const filterItem = {...item,value:columnValue,visibility:'visible'};
                filterColumnsContainer.push(filterItem);
                return filterItem;
            }else{
                return item;
            }
       });
       const data = this.state.data.filter((item)=>{
           return item[columnKey] === columnValue;
       });
       this.setState({
            data,
            visibleColumns,
            filterColumnsContainer,
            selectedIndex:index
       });
    }
    cancelFilterColumns(filterColumn){
        const visibleColumns = this.state.visibleColumns.map((item)=>{
            if(filterColumn.title === item.title){
                return {...item,value:'&nbsp;',visibility:'hidden'};
            }else{
                return item;
            }
        });
        const filterColumnsContainer= this.state.filterColumnsContainer;
        filterColumnsContainer.splice(filterColumnsContainer.findIndex(item => item.title === filterColumn.title), 1);
        const data = this.props.data.filter((item)=>{
            let flag = true;
            filterColumnsContainer.forEach((filterItem)=>{
                if(filterItem.value !== item[filterItem.title]){
                    flag = false;
                    return flag;
                }
            });
           return flag;
       });
       this.setState({
            data,
            visibleColumns,
            filterColumnsContainer
       });
    }
    handleSortSelectedHeader({ oldIndex, newIndex }){
        const visibleColumns = arrayMove(this.state.visibleColumns, oldIndex, newIndex);
        this.setState({visibleColumns:visibleColumns});
    }
    handleClickOnVoidButton(selectedTransactionId){
        this.setState({
            modalVoidVisible:true,
            selectedTransactionId
        })
    }
    handleClickToCancelVoidModal(){
        this.setState({
            modalVoidVisible:false,
            selectedTransactionId:0
        })
    }
    handleSubmitVoidAction(){
        if(this.state.selectedTransactionId){

        }
        this.setState({
            modalVoidVisible:false,
            selectedTransactionId:0
        })
    }
    handleFormat(columnKey,item){
        if(item[columnKey] === null){
            return '';
        }
        switch (columnKey.toLowerCase()){
            case 'voidable':
                return <Button variant="outline-dark" size="sm" disabled={item[columnKey]==='false' ? true  : false} onClick={()=>{this.handleClickOnVoidButton(item['Myriad Transaction ID'])}}>Void</Button>;
            case 'registration date':
                return moment(item[columnKey]).format("YYYY-MM-DD");
            case 'time':
                return moment(item[columnKey]).format("YYYY-MM-DD hh:mm:ss");
            case 'amount':
            case 'average difference %':
            case 'average difference £':
            case 'internal amount':
                return item[columnKey].toFixed(2);
            case '1st deposit date':
                return moment(item[columnKey]).format("YYYY-MM-DD hh:mm:ss");
            default:
                return item[columnKey];
        }
    }
    handleFilterFormat(columnKey,value){
        if(value === '&nbsp;'){
            return value;
        }
        switch (columnKey.toLowerCase()){
            case 'registration date':
                return moment(value).format("YYYY-MM-DD");
            case 'time':
                return moment(value).format("YYYY-MM-DD hh:mm:ss");
            case '1st deposit date':
                return moment(value).format("YYYY-MM-DD hh:mm:ss");
            default:
                return value;
        }
    }
    columnCompare(property,type) {
        if(type === true){
            return function(a,b) {
                let value1 = a[property];
                let value2 = b[property];
                if (value1 === '' || value1 === null) {
                    if (value2 === '' || value2 === null) {
                        return 0; 
                    }
                    return -1; 
                }
                if (value2 === '' || value2 === null) {
                    if (value1 === '' || value1 === null) {
                        return 0; 
                    }
                    return 1; 
                }
                if(value2 < value1){
                    return 1;
                }else if(value2 > value1){
                    return -1;
                }else{
                    return 0;
                }
            }
        }else{
            return function(a,b) {
                let value1 = a[property];
                let value2 = b[property];
                if (value1 === '' || value1 === null) {
                    if (value2 === '' || value2 === null) {
                        return 0; 
                    }
                    return -1; 
                }
                if (value2 === '' || value2 === null) {
                    if (value1 === '' || value1 === null) {
                        return 0; 
                    }
                    return 1; 
                }
                if(value2 > value1){
                    return 1;
                }else if(value2 < value1){
                    return -1;
                }else{
                    return 0;
                }
            }
        }
    }
    handleClickToSort(property,type) {
        const data= [...this.state.data];
        data.sort(this.columnCompare(property,type))
        this.setState({
            data
        })
    }
    render () {
        const {visibleColumns,data,modalVoidVisible,openTransactionDetail} = this.state;
        const {channel,transactionDetails} = this.props;
        return (
            <div>
                <Row>
                    <Col xs={8} style={{ overflow: 'scroll', maxHeight: '50rem',minHeight:'50rem',flex:`0 0 ${openTransactionDetail.width}`,maxWidth:`${openTransactionDetail.width}` }}>
                        <Table striped bordered hover responsive='sm' size='sm'>
                            <thead>
                                <tr>
                                    {visibleColumns.map(
                                        (item,index)=>{
                                            return <td onClick={()=>this.cancelFilterColumns(item)} key={index} style={{whiteSpace:'nowrap',backgroundColor:'red',visibility:item.visibility}}>{this.handleFilterFormat(item.title,item.value)}</td>
                                        }
                                    )}
                                </tr>
                                <VisibleHeaderList
                                    items={visibleColumns}
                                    onSortEnd={({ oldIndex, newIndex }) => this.handleSortSelectedHeader({ oldIndex, newIndex })}
                                    lockAxis='x'
                                    axis='x'
                                    distance={20}
                                    lockToContainerEdges={true}
                                    handleClickToSort={this.handleClickToSort}
                                />
                            </thead>
                            <tbody>
                                {data.map(
                                    (item,index)=>{
                                        return (
                                            <tr key={index} >
                                                {visibleColumns.map(
                                                    (columnHeader,num)=>{
                                                        const columnKey = columnHeader.title;
                                                        return (
                                                            <td key={num} onDoubleClick={()=>{this.handleDoubleClickOnRow(columnKey,item[columnKey],index)} }  onClick={()=>{this.handleOneClickOnRow(index)}} style={{whiteSpace:'nowrap',backgroundColor:this.state.selectedIndex === index?'#cce5ff' :'' }}>
                                                                { 
                                                                    this.handleFormat(columnKey,item)
                                                                }
                                                            </td>
                                                        )
                                                    }
                                                )}
                                            </tr>
                                        )
                                    }
                                )}
                            </tbody>
                        </Table>
                    </Col>
                    {/* component for transaction details Button*/}
                    <Button variant="outline-dark" style={{width:'2rem',textAlign:'center',height: '50rem',padding:0,backgroundColor:'#dee2e6'}} onClick={()=>{this.handleClickOnTransactionDetailsButton()}}>
                        <span>{openTransactionDetail.arrow}</span>
                        <div style={{marginTop:'20rem',marginBottom:'20rem',fontWeight:'bold'}}>
                            T
                        </div>
                        <span>{openTransactionDetail.arrow}</span>
                    </Button>
                    <Col xs={3} style={{display:`${openTransactionDetail.display}`}}>
                    {/* component for showing transaction details */}
                        <TransactionDetails
                            transactionDetails={transactionDetails}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        Number of transactions visible:{data.length}
                    </Col>
                    <Col xs={{ span: 2, offset: 5 }} style={{textAlign:'right'}}>
                        <span style={{color:'blue'}}>{channel}</span>
                    </Col>
                </Row>
                {/* component for showing Void modal */}
                <Modal show={modalVoidVisible} onHide={this.handleClickToCancelVoidModal} aria-labelledby="contained-modal-title-vcenter" centered size="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Void</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure want to void this transaction</Modal.Body>
                        <Modal.Footer>
                        <Button variant="primary" onClick={this.handleSubmitVoidAction}>
                            Yes
                        </Button>
                        <Button variant="secondary" onClick={this.handleClickToCancelVoidModal}>
                            No
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
            
        )
    }
}
