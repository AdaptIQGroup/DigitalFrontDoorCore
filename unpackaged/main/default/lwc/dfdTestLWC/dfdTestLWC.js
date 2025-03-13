import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOptionRecord from '@salesforce/apex/dfdTestLwcController.getOptionRecord';
import createCase from '@salesforce/apex/dfdTestLwcController.createCase';

export default class DfdTestLWC extends LightningElement {

    @api recordId;
    subject;
    description;
    origin;
    status;
    priority;
    type;
    showSpinner = false;
    optionRecord;

        get originOptions() {
        return [
            { label: '', value: '' },
            { label: 'Phone', value: 'Phone' },
            { label: 'Email', value: 'Email' },
            { label: 'Web', value: 'Web' },
        ];
    }

    get statusOptions(){

        return [
            { label: '', value: '' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Escalated', value: 'Escalated' },
            { label: 'Fixed', value: 'Fixed' },
        ];        
    }

    get priorityOptions(){

        return [
            { label: '', value: '' },
            { label: '1-Low', value: '1-Low' },
            { label: '2-Normal', value: '2-Normal' },
            { label: '3-Medium', value: '3-Medium' },
            { label: '4-High', value: '4-High' },
            { label: '5-Urgent', value: '5-Urgent' },
        ];  
    }

    connectedCallback() {
        console.log('recordId---->'+this.recordId);
        this.loadValues();

    }

    loadValues()
    {
        getOptionRecord({recordId: this.recordId})
        .then(result =>{
            console.log('result--->'+JSON.stringify(result));
            this.optionRecord = result;
            this.subject = result.Option_Name__c;
            this.origin = 'Web';
            this.type = result.Option_Name__c;
        })

    }

    handleInputChange(event)
    {
        let dataId = event.target.dataset.id;
        if(dataId == 'Origin')
        {
            this.origin = event.target.value;
        }
        else if(dataId == 'Status')
        {
            this.status = event.target.value;
        }
        else if(dataId == 'Priority')
        {
            this.priority = event.target.value;
        }
        else if(dataId == 'Subject')
        {
            this.subject = event.target.value;
        }         
        else if(dataId == 'Description')
        {
            this.description = event.target.value;
        } 
    }

    handleCaseCreation()
    {
        this.showSpinner = true;
        createCase({subject:this.subject,description:this.description,origin:this.origin,status:this.status,
                    priority:this.priority, type:this.type})
        .then((result) => {
            console.log('caseNumber--->'+result);
            this.loadValues();
      const event = new ShowToastEvent({
        title: 'Success',
        message: 'Case created successfully!',
        variant: 'success',
        mode: 'dismissable'
        });
        this.dispatchEvent(event); 
        this.showSpinner = false;

        }).catch((err) => {
        this.showSpinner = false;
            console.log('Error---->'+JSON.stringify(err));
        });
    }

}