import { LightningElement, api, track,wire } from 'lwc';
import EMP from '@salesforce/schema/Employee__c';
import EmpName from '@salesforce/schema/Employee__c.Emp_Name__c';
import {
    createRecord,
    getFieldValue,
    updateRecord,
    deleteRecord,
    generateRecordInputForUpdate
} from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import ID from '@salesforce/schema/Employee__c.Id';
import EmpEmail from '@salesforce/schema/Employee__c.Emp_Email__c';
import EmpID from '@salesforce/schema/Employee__c.name';
import PrimarySkill from '@salesforce/schema/Employee__c.Primary_Skill__c';
import SecondarySkill from '@salesforce/schema/Employee__c.Secondary_Skill__c';
import Experience from '@salesforce/schema/Employee__c.Experience__c';
import Comments from '@salesforce/schema/Employee__c.Comments__c';
import getemp from '@salesforce/apex/getDataFromEmployee.getemp';
const COLS = [
    { label: 'ID', fieldName: 'Name'},
    { label: 'Name', fieldName: 'Emp_Name__c', editable: true },
    { label: 'Email', fieldName: 'Emp_Email__c', editable: true,  type: 'email'},
    { label: 'Primary Skills', fieldName: 'Primary_Skill__c', editable: true },
    { label: 'Secondary Skills', fieldName: 'Secondary_Skill__c', editable: true },
    { label: 'Experience', fieldName: 'Experience__c', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', editable: true }
];
export default class EmployeeComponent extends LightningElement {

    @track error;
    @track columns = COLS;
    @track draftValues = [];

    @track recId;
    @wire(getemp)
    emps;

    //fields = [EmpID,EmpName,EmpEmail,PrimarySkill,SecondarySkill,Experience,Comments];
    @api buttonlabel="Create Employee";
    @track employeename;
    @track employeeemail;
    @track primarySkill;
    @track secondarySkill;
    @track experience;
    @track comments;
   
    handlechange(event){
        if(event.target.label =='Employee Name'){
            this.employeename=event.target.value; 
        }
        if(event.target.label =='Employee Email'){
            this.employeeemail=event.target.value;
        }
        if(event.target.label =='Primary Skill'){
            this.primarySkill=event.target.value;
        }
        if(event.target.label =='Secondary Skill'){
            this.secondarySkill=event.target.value;
        }
        if(event.target.label =='Experience'){
            this.experience=event.target.value;
        }
        if(event.target.label =='Comments'){
            this.comments=event.target.value;
        }

    }
    submit(event){
        const fields={};
        fields[EmpName.fieldApiName]=this.employeename;
        fields[EmpEmail.fieldApiName]=this.employeeemail;
        fields[PrimarySkill.fieldApiName]=this.primarySkill;
        fields[SecondarySkill.fieldApiName]=this.secondarySkill;
        fields[Experience.fieldApiName]=this.experience;
        fields[Comments.fieldApiName]=this.comments;
        const recordInput = {
            apiName: EMP.objectApiName,
            fields
        };
        createRecord(recordInput)
        .then(Employee =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Employee Added Successfully',
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
        return refreshApex(this.emps);
        location.reload();
    }
    handleReset(event) {
        const inputFields = this.template.querySelectorAll(
            'lightning-input'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
     }
     handleClickAdd() {

        var el = this.template.querySelector('lightning-datatable');
        var selected = el.getSelectedRows();
        let selectedIdsArray = [];

        for (const element of selected) {
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
            return refreshApex(this.emps);
            location.reload();
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
             return refreshApex(this.emps);
        }).catch(error => {
            // Handle error
        });
        return refreshApex(this.emps);
    }

}