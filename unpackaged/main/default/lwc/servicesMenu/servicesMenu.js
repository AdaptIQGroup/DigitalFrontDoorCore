import { LightningElement,api } from 'lwc';
import getOptionsMap from '@salesforce/apex/DFD_ServicesMenuController.getOptionsMap';
import getUserLoginInfo from '@salesforce/apex/DFD_ServicesMenuController.getUserLoginInfo';

export default class ServicesMenu extends LightningElement {

    @api recordId;
    //variables to organize option records into Hierarchy
    optionsMap = new Map();
    serviceToOptionsMap = new Map();
    rootRecordId;
    rootRecord;
    childList     = [];
    childList2    = [];
    nextChildList = [];
    level = 1;

    showHeader      = false;
    showSubHeader   = false;
    showDescription = false;
    header      = '';
    subHeader   = '';
    description = '';

    currentSelectedOption;
    showMenu      = false;
    noOptions     = false;
    navOptions    = [];
    navOptionsMap = new Map();

    layoutItem_LeftColumnSize = 12;
    layoutItem_RightColumnSize = 4;
    showRightColumn           = false;
    rightColumnText           = '';
    class_OptionsPerRow       = 'slds-col slds-size_1-of-3';
    linksPerOption            = 3;
    optionLinkFontSize        = 'font-size:13px;';
    optionFontSize            = 'font-size:15px;';

    menuOptions = [];
    //variables for dynamicaly embedding components
    showEmbededScreenFlow = false;
    showEmbededLWC = false;
    componentConstructor;
    componentName = '';
    showActionButton = false;
    actionButtonName = 'Action';
    componentToRender;
    showDynamicInstantiateLWC = false;

    loginURL = '';
    loginRequired = false;
    authorizedLoginText = 'Please login to create a case.'
    loggedIn = false;
    flowInputVariables;
    dynamicLwcRecordId;


  setFlowInputVariables(optionRecordId)
  {
      this.flowInputVariables = [
      {
            name: "recordId",
            type: "String",
            value: optionRecordId,
      }          
      ];
  }

    async connectedCallback()
    {
        //console.log('recordId---->'+this.recordId);

        await this.getUserLoginDetails();
        this.getServicesOptions();

        //let root = document.querySelector('my-css');
        //root.style.setProperty('--slds-c-card-color-background', '#D41313');

        /*var cols = document.getElementsByClassName('mycss');
        console.log('cols--->'+JSON.stringify(cols));
        console.log('cols--->'+cols.length);*/
        //for(i = 0; i < cols.length; i++) {
            //cols[i].style.sldsccardcolorbackground = '#D41313';
            //console.log('col--->'+JSON.stringify(cols[i]));
       // }

        //this.getLightningLayoutSize();
    }

    getUserLoginDetails()
    {
      return getUserLoginInfo({})
            .then(result => {
                this.loggedIn = !result.isGuestUser;
                this.loginURL = result.loginURL;
                console.log('isGuestUser--->'+result.isGuestUser);
                console.log('loginURL--->'+result.loginURL);
               // this.getServicesOptions();
            })
            .catch(error => {
                console.log('error--->'+JSON.stringify(error));
                this.showSpinner = false;
            });
    }
 
    handleLinkClick(event)
    {
        event.preventDefault();
        let currentLinkRecord = this.navOptionsMap.get(event.target.dataset.id);
        this.navOptions.push(this.navOptionsMap.get(currentLinkRecord.Option__c));
        this.handleSelection(event);
    }

    getServicesOptions()
    {
            getOptionsMap({})
            .then(result => {
                this.optionRecords = result.optionRecords;
               // console.log('records--->'+JSON.stringify(result));
                this.class_OptionsPerRow = this.class_OptionsPerRow ? ('slds-col slds-size_1-of-' + result.optionsPerRow):this.class_OptionsPerRow;
                this.optionFontSize = result.optionFontSize ? ('font-size:' + result.optionFontSize + 'px;') : this.optionFontSize;
                this.optionLinkFontSize = result.optionLinkFontSize ? ('font-size:' + result.optionLinkFontSize + 'px;') : this.optionLinkFontSize;
                this.linksPerOption = result.linksPerOption ? result.linksPerOption : this.linksPerOption;
                this.rootRecordId = result.rootRecordId;
                //console.log('result---->'+JSON.stringify(result));
                this.prepareOptionsMap();
               // console.log('prep done');
                //this.setDefaultMenu();
                //this.setDefaultNavOption();

                if(this.loggedIn)
                {
                    let storedOptionId = localStorage.getItem('DFD_OptionId');
                    if(storedOptionId)
                    {
                        //console.log('Successfully found storedOptionId--->'+storedOptionId);
                        let event = {};
                        let target = {};
                        let dataset = {};
                        dataset.id = storedOptionId;
                        target.dataset = dataset;
                        event.target = target;
                        event.preventDefault =  function() {}; // to bypass event.preventDefault( in handleSelection); 
                        //console.log('event-->'+event.target.dataset.id);
                        delete localStorage.DFD_OptionId;
                        this.handleSelection(event);
                    }
                    else
                    {
                        this.setDefaultMenu();
                        this.setDefaultNavOption();                        
                    }
                }
                else
                {
                    this.setDefaultMenu();
                    this.setDefaultNavOption();
                }

                console.log('done getServicesOptions');

                console.log('loginRequired--->'+this.loginRequired);
            })
            /*.catch(error => {
                console.log('error--->'+JSON.stringify(error));
            // this.showSpinner = false;
            });*/

    }

    setDefaultNavOption()
    {
        this.navOptions.push(this.rootRecord);
    }

    prepareOptionsMap()
    {
        //let rootRecId = this.rootRecordId;
        for(let opt of this.optionRecords)
        {
            if(opt.hasOwnProperty('Option__c'))
            {
                this.optionsMap.set(opt.Id, opt);
            }
            else if(opt.Id == this.rootRecordId)
            {
                this.rootRecord = opt;
                this.currentSelectedOption = opt;
                if(opt.Header__c)
                {
                    this.header = opt.Header__c;
                    this.showHeader = true;
                }
                if(opt.Sub_Header__c)
                {
                    this.subHeader = opt.Sub_Header__c;
                    this.showSubHeader = true;
                }
                if(opt.Description__c)
                {
                    this.description = opt.Description__c;
                    this.showDescription = true;
                }
                if(opt.Right_Section_Text__c)
                {
                    this.rightColumnText = opt.Right_Section_Text__c;
                    this.layoutItem_LeftColumnSize = 8;
                    this.showRightColumn = true;
                }
                this.componentInitHelper(opt);
            }
                this.navOptionsMap.set(opt.Id,opt);
        }

        while(this.optionsMap.size>0)
        {
            if(this.level == 1)
            {
            this.childList = this.filterChild(this.rootRecord.Id,this.optionsMap.values(),this.optionsMap);
            this.serviceToOptionsMap.set(this.rootRecord.Id,this.childList);
            this.level++;                
            }
            else
            {
                this.nextChildList = [];
                for(let opt of this.childList)
                {
                    this.childList2 = [];
                    this.childList2 = this.filterChild(opt.Id,this.optionsMap.values(),this.optionsMap);
                    this.nextChildList.push(...this.childList2);
                    this.serviceToOptionsMap.set(opt.Id,this.childList2);
                }
                this.childList = [];
                this.childList.push(...this.nextChildList);
                this.level++;
            }
        }
        console.log('prep done');
    }

    filterChild(parentId,options,optionsMap)
    {
        let childList = [];
        for(let opt of options)
        {
            if(opt.Option__c == parentId)
            {
                childList.push(opt);
                this.optionsMap.delete(opt.Id);
            }
        }        
        return childList;    
    }

    setDefaultMenu()
    {
        //console.log('this.serviceToOptionsMap.get(this.rootRecord.Id)--->'+this.serviceToOptionsMap.get(this.rootRecord.Id))
        for(let opt of this.serviceToOptionsMap.get(this.rootRecord.Id))
        {
            this.prepareInOptionLinks(opt);
            this.menuOptions.push(opt);
        }
        this.showMenu = true;
        //console.log('this.menuOptions--->'+JSON.stringify(this.menuOptions));
        //console.log('this.rootRecord--->'+this.showMenu);
    }

    prepareInOptionLinks(option)
    {
        let inOptionLinks = [];
        let hasChildOptions = false;
        //console.log('option--->'+JSON.stringify(option));
        //console.log('this.serviceToOptionsMap.get(option.Id)---->'+JSON.stringify(this.serviceToOptionsMap.get(option.Id)));
        if(this.serviceToOptionsMap.get(option.Id))
        {
            hasChildOptions = this.serviceToOptionsMap.get(option.Id).length >0 ? true : false;
            for(let childOpt of this.serviceToOptionsMap.get(option.Id))
            {   
                //console.log('inside');
                let opt ={};
                opt = {...childOpt};
                opt.Option_Name__c = '• ' + opt.Option_Name__c; 
                //childOpt.Option_Name__c = '• ' + childOpt.Option_Name__c;             
                inOptionLinks.push(opt);
                if(inOptionLinks.length == this.linksPerOption)
                {
                    break;
                }
            }
        }
        option.inOptionLinks = inOptionLinks;
        option.hasChildOptions = hasChildOptions;
    }

    handleSelection(event)
    {
        //console.log('event detail---->'+event.target.dataset.id);

        event.preventDefault();
        //debugger;
        //console.log('event detail---->'+event.target.dataset.id);
        this.showMenu = false
        this.menuOptions = [];
        let options = false;
        this.currentSelectedOption = this.navOptionsMap.get(event.target.dataset.id);
        //console.log('done1')
        if(this.serviceToOptionsMap.get(event.target.dataset.id))
        {
            for(let opt of this.serviceToOptionsMap.get(event.target.dataset.id))
            {
                this.menuOptions.push(opt);
                this.prepareInOptionLinks(opt);
                options = true;
            }
        }
       // console.log('done 2');
        //console.log('this.navOptionsMap.get(event.target.dataset.id)---->'+this.navOptionsMap.get(event.target.dataset.id));
        this.componentInitHelper(this.navOptionsMap.get(event.target.dataset.id));

      // if(this.loggedIn)
      // {
           let optionId = this.currentSelectedOption.Id;
           this.navOptions = [];
            while(this.navOptionsMap.get(optionId))
            {
                /*if(!this.navOptions.length > 0)
                {

                }
                else
                {
                    this.navOptions.push(this.navOptionsMap.get(this.currentSelectedOption.Id));
                }*/
                   this.navOptions.push(this.navOptionsMap.get(optionId));
                    optionId = this.navOptionsMap.get(optionId).Option__c;
            }
            //this.navOptions = [...this.navOptions.reverse()];
            this.navOptions.reverse();
           

      /* }
       else
       {*/
            if(this.navOptions.includes(this.navOptionsMap.get(event.target.dataset.id)))
            {
                this.navOptions.length = this.navOptions.indexOf(this.navOptionsMap.get(event.target.dataset.id)) + 1;
            }
            else
            {
                this.navOptions.push(this.navOptionsMap.get(event.target.dataset.id));
            }
      // }*/
        
        this.setHeadersAndDescription(event);
        this.setColumns(event);
        if(!options)
        {
            this.noOptions = true;
        }
        else
        {
            this.noOptions = false;
        }
        this.showMenu = true;
               // var cols = document.querySelectorAll('.mycss');
       // console.log('cols--->'+JSON.stringify(cols));
       // console.log('cols--->'+cols.length);
    }

    setHeadersAndDescription(event)
    {
        this.showHeader      = false;
        this.showSubHeader   = false;
        this.showDescription = false;
        
        let currentSelectedOption = this.navOptionsMap.get(event.target.dataset.id);
        if(currentSelectedOption.Header__c)
        {
            this.header = currentSelectedOption.Header__c;
            this.showHeader = true;
        }
        if(currentSelectedOption.Sub_Header__c)
        {
            this.subHeader = currentSelectedOption.Sub_Header__c;
            this.showSubHeader = true;
        }
        if(currentSelectedOption.Description__c)
        {
            this.description = currentSelectedOption.Description__c;
            this.showDescription = true;
        }    
    }

    setColumns(event)
    {
        this.showRightColumn = false
        this.rightColumnText = '';
        this.layoutItem_LeftColumnSize = 12;
        let currentSelectedOption = this.navOptionsMap.get(event.target.dataset.id);
        if(currentSelectedOption.Right_Section_Text__c)
        {
            this.rightColumnText = currentSelectedOption.Right_Section_Text__c;
            this.layoutItem_LeftColumnSize = 8;
            this.showRightColumn = true;
        }
    }

   async componentInitHelper(opt)
    {
        this.showEmbededScreenFlow = false;
        this.showEmbededLWC = false;
        this.showActionButton = false;
        this.actionButtonName = 'Action';
        this.loginRequired = false;

        console.log('componentInitHelper before--->'+this.loginRequired);
        
        if(opt.Component_Active__c && opt.Component_Name__c && opt.Component_Type__c && opt.Component_Mode__c)
        {
            if(opt.Login_Type__c && opt.Login_Type__c == 'Authorized' && !this.loggedIn)
            {
                this.loginRequired = true;
                this.authorizedLoginText = opt.Authorized_Login_Text__c;
            }
            else
            {
                this.loginRequired = false;
                this.componentName = opt.Component_Name__c;
                if(opt.Component_Type__c == 'Screen Flow')
                {
                    this.setFlowInputVariables(opt.Id);
                    if(opt.Component_Mode__c == 'Embeded')
                    {
                        this.showEmbededScreenFlow = true;
                    }
                    else if (opt.Component_Mode__c == 'On Button Press')
                    {
                        this.showActionButton = true;
                        this.actionButtonName = opt.Component_Button_Name__c;
                    }
                }
                else if(opt.Component_Type__c == 'LWC')
                {
                    this.dynamicLwcRecordId = opt.Id;
                    if(opt.Component_Mode__c == 'Embeded')
                    {
                        this.componentToRender = `c/${opt.Component_Name__c}`;
                        this.renderComponent(this.componentToRender);
                        this.showEmbededLWC = true;
                    }
                    else if (opt.Component_Mode__c == 'On Button Press')
                    {
                        this.showActionButton = true;
                        this.actionButtonName = opt.Component_Button_Name__c;
                    }                        
                }
            }

            console.log('componentInitHelper after--->'+this.loginRequired);
        } 
    }
    async renderComponent(componentToRender)
    {
       // console.log('inside renderComponent with name--->'+componentToRender);
        /*const ctor = await import (componentToRender);// statically analyzable dynamic import
        this.componentConstructor = ctor.default; */ 

        import(componentToRender)
        .then(({ default: ctor }) => {
            this.componentConstructor = ctor
        })
        .catch((err) => console.log("Error importing component--->"+err));        
        //const { default: DynamicImport } = await import(componentToRender);
        //return DynamicImport; 
        //this.componentConstructor = DynamicImport;  
    }

    handleActionButton()
    {
        if(this.currentSelectedOption.Component_Type__c == 'Screen Flow')
        {
            this.showEmbededScreenFlow = true;
        }
        else if(this.currentSelectedOption.Component_Type__c == 'LWC')
        {
            const componentToRender = `c/${this.currentSelectedOption.Component_Name__c}`;
            this.renderComponent(componentToRender);
            this.showEmbededLWC = true;
        }
        this.actionButtonName = 'Action';
        this.showActionButton = false;
    }
    handleLogin()
    {
        localStorage.setItem('DFD_OptionId',this.currentSelectedOption.Id);
        window.open(this.loginURL,'_self');
    }
}