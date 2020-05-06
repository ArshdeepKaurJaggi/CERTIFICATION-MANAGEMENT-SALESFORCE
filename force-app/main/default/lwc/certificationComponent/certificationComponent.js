import { LightningElement, api, track,wire } from 'lwc';
import CERT from '@salesforce/schema/Certification__c';
import Cert_Name from '@salesforce/schema/Certification__c.Cert_Name__c';
import Cert_Comments from '@salesforce/schema/Certification__c.Comments__c';
import Cert_Id from '@salesforce/schema/Certification__c.Name';
import {
    createRecord,
    updateRecord,
    deleteRecord,
} from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import getcert from '@salesforce/apex/getDataCert.getcert';
const COLS = [
    { label: 'ID', fieldName: 'Name'},
    { label: 'Name', fieldName: 'Cert_Name__c', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', editable: true},
];

export default class CertificationComponent extends LightningElement {
    @api buttonlabel="Add Certification";
    @track certname;
    @track certcomments;

    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track recId;
    @wire(getcert)cert;
    handlechange(event){
        if(event.target.label =='Certification Name'){
            this.certname=event.target.value; 
        }
        if(event.target.label =='Comments'){
            this.certcomments=event.target.value;
        }
        console.log("handled");
    }
    submit(event){
        const fields={};
        fields[Cert_Name.fieldApiName]=this.certname;
        fields[Cert_Comments.fieldApiName]=this.certcomments;
        const recordInput = {
            apiName: CERT.objectApiName,
            fields
        };
        createRecord(recordInput)
        .then(Certification =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Certification Added Successfully',
                        variant: 'success',
                    }),
                );
            })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
        location.reload();
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
                return refreshApex(this.cert);
                location.reload();   
    }
    handleSave(event) {
        console.log("save");
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
    
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(CERT => {
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
            
             return refreshApex(this.cert);
             location.reload();
        }).catch(error => {
            // Handle error
        });
    }
}