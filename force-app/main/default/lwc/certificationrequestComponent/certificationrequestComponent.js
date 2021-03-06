import { LightningElement, api, track, wire } from 'lwc';
import CERTREQ from '@salesforce/schema/Certification_Request__c';
import Cert_field from '@salesforce/schema/Certification_Request__c.Certification__c';
import Cert_Comments from '@salesforce/schema/Certification_Request__c.Comments__c';
import Cert_Emp from '@salesforce/schema/Certification_Request__c.Employee__c';
import Cert_ReqID from '@salesforce/schema/Certification_Request__c.Name';
import Cert_Voucher from '@salesforce/schema/Certification_Request__c.Voucher__c';
import Cert_Status from '@salesforce/schema/Certification_Request__c.Status__c';
import Cert_EmailR from '@salesforce/schema/Certification_Request__c.Email_Recipient__c';
import Cert_DueDate from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import {
    createRecord,
    updateRecord,
    deleteRecord,
    getFieldValue,
} from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import fetchPickListValue from '@salesforce/apex/fetchstatusvalues.fetchStatusPickListValue';
import getList from '@salesforce/apex/getVoucher.getList';
import getCertReq from '@salesforce/apex/fetchcertreq.getCertRList';
const cols = [
    { label: 'Request Id', fieldName: 'Name' },
    { label: 'Certification Name', fieldName: 'Certification__c' },
    { label: 'Employee Name', fieldName: 'Employee__c' },
    { label: 'Voucher Name', fieldName: 'Voucher__c' },
    { label: 'Due Date', fieldName: 'Due_Date__c', editable: 'true', type: 'date' },
    { label: 'Comments', fieldName: 'Comments__c', editable: 'true' },
    { label: 'Status', fieldName: 'Status__c', editable: 'true' }
];
export default class CertificationrequestComponent extends LightningElement {
    @api buttonlabel = "Add Certification Request";
    @track recId;
    fields = [Cert_field, Cert_Emp, Cert_DueDate, Cert_Comments, Cert_Voucher, Cert_Status];

    handleSuccess(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Request  Created !',
            variant: 'success'
        }));
        location.reload();
    }
    @track data;
    @track columns = cols;
    @wire(getCertReq) certreqwire;
    @wire(getCertReq)
    Certification_Request__c(result) {
        this.refreshing = result;
        if (result.data) {
            let values = [];
            result.data.forEach(i => {
                let value = {};
                value.Id = i.Id;
                value.Name = i.Name;
                value.Certification__c = i.Certification__r.Cert_Name__c;
                value.Employee__c = i.Employee__r.Emp_Name__c;
                value.Due_Date__c = i.Due_Date__c;
                value.Status__c = i.Status__c;
                if (i.hasOwnProperty('Voucher__r')) {
                    value.Voucher__c = i.Voucher__r.Voucher_Name__c;
                } else {
                    value.Voucher__c = "";
                }
                value.Comments__c = i.Comments__c;
                values.push(value);
            });
            this.data = values;
            console.log(result.data);
            // this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.data = undefined;
            this.error = result.error;
        }
        console.log("Error: " + this.error);
    }

    handleSave(event) {
        console.log("save");
        const recordInputs = event.detail.draftValues.slice().map(draft => {
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
            return refreshApex(this.certreqwire);
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

        return refreshApex(this.certreqwire);

    }
}