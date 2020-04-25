import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import {
    createRecord,
    getFieldValue,
    updateRecord,
    deleteRecord,
    generateRecordInputForUpdate
} from 'lightning/uiRecordApi';
import Vou_Object from '@salesforce/schema/Voucher__c';
import VouId from '@salesforce/schema/Voucher__c.Id';
import VouName from '@salesforce/schema/Voucher__c.Voucher_Name__c';
import VouCost from '@salesforce/schema/Voucher__c.Voucher_Cost__c';
import VouVal from '@salesforce/schema/Voucher__c.Validity__c';
import VouAct from '@salesforce/schema/Voucher__c.Active__c';
import VouCert from '@salesforce/schema/Voucher__c.Certification__c';
// import getVoucList from '@salesforce/apex/getVoucherListNew.getVouList';
import getVouList from '@salesforce/apex/getVoucherListNew.getVouList';

const cols=[
    { label: 'Voucher Id', fieldName: 'Name'},
    { label: 'Voucher Name', fieldName: 'Voucher_Name__c', editable: 'true'},
    { label: 'Voucher Cost', fieldName: 'Voucher_Cost__c', editable: 'true', type: 'currency', typeAttributes: { currencyCode: 'INR'}, cellAttributes: { alignment: 'left' } },
    { label: 'Voucher Validity', fieldName: 'Validity__c', editable: 'true'},
    { label: 'Active', fieldName: 'Active__c', editable: 'true'},
    // { label: 'Certification Name', fieldName: 'Certification__c', editable: 'true'},
];

export default class Vouchercomponent extends LightningElement {
    
    @track recId;
    fields = [VouName, VouCost, VouVal, VouAct, VouCert];

    handleSuccess(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Voucher Created !',
            variant: 'success'
        }));
        location.reload();
    }

    @track data;
    @track columns = cols;
    @track draftValues=[];

    error;
    refreshing;
    @wire(getVouList)vo;
    @wire(getVouList)
    Voucher__c(result) {
        this.refreshing = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.data = undefined;
            this.error = result.error;
        }
        console.log("Error: " + this.error);
    }

    handleSave(event) {
        console.log("save");
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
    
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(EMP => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Data updated',
                    variant: 'success'
                })
            );
             // Clear all draft values
             this.draftValues = [];
    
             // Display fresh data in the datatable
             return refreshApex(this.vo);
        }).catch(error => {
            // Handle error
        });
    }
    handleClickAdd() {

        var el = this.template.querySelector('lightning-datatable');
        var selected = el.getSelectedRows();
        let selectedIdsArray = [];

        for (const element of selected) {
            //console.log('elementid', element.Id);
            selectedIdsArray.push(element.Id);
        }
        this.recId = selectedIdsArray[0];
        console.log(this.recId);
     }
     deleteRec(event) {
        console.log('delete');
        deleteRecord(this.recId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
            
            return refreshApex(this.vo);
            location.reload();
    }

}