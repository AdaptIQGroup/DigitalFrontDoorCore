/**
--------------------------------------------------------------------------------------------------------------------------------------------
Name                  : DFD_ServicesMenuController
Created By            : Ribanshu@Adpat-iq
Created Version       : V1.00
Description           : Apex contoller for servicesMenu LWC component
---------------------------------------------------------------------------------------------------------------------------------------------    
___________________________________________________________________________Change Log_________________________________________________________________________________________________________

Modified by              Version         Change Date         Purpose
______________________________________________________________________________________________________________________________________________________________________________________________
**/

public with sharing class  DFD_ServicesMenuController {
    @AuraEnabled
    //public static Map<Integer, List<Option__c>> getOptionsMap(Id rootRecordId)
    public static ResultWrapper getOptionsMap()
    {
        //Map<Integer, List<Option__c>> optionsMap = new Map<Integer, List<Option__c>>();
        //Map<String,List<Option__c>> optionsMap2 = new Map<String,List<Option__c>>();
        //Option__c rootRecord = new Option__c();
        ResultWrapper resWrap = new ResultWrapper();

       /* List<DFD_Config__mdt> dfdConfigs = DFD_Config__mdt.getAll().values();

        if(dfdConfigs[0].Root_Option_RecordId__c != NULL)
        {
            rootRecord = [SELECT Id,Name,Header__c,Sub_Header__c,In_Option_Description__c,Description__c,Option_Name__c,
                          Right_Section_Text__c,Component_Type__c,Component_Mode__c,Component_Name__c,Component_Active__c,
                          Component_Button_Name__c
                          FROM Option__c 
                          WHERE Id =:dfdConfigs[0].Root_Option_RecordId__c];
        }

        optionsMap.put(0,new list<Option__c>{rootRecord});
        
        Map<Id,Option__c> childOptionsMap = new Map<Id,Option__c>([SELECT Id,Name,Header__c,Sub_Header__c,In_Option_Description__c,Description__c,Right_Section_Text__c,
                                                                   Option_Name__c,Option__c,Component_Type__c,Component_Mode__c,Component_Name__c,Component_Active__c,
                                                                   Component_Button_Name__c
                                                                   FROM Option__c 
                                                                   WHERE id != :rootRecord.Id]); */
        List<Option__c> optionRecords = [SELECT Id,Name,Header__c,Sub_Header__c,In_Option_Description__c,Description__c,Right_Section_Text__c,
                                        Option_Name__c,Option__c,Component_Type__c,Component_Mode__c,Component_Name__c,Component_Active__c,
                                        Component_Button_Name__c,Login_Type__c,Authorized_Login_Text__c
                                        FROM Option__c];

        resWrap.optionRecords = optionRecords;

        List<DFD_Config__mdt> dfdConfigs = DFD_Config__mdt.getAll().values();
        if(dfdConfigs.size()>0)
        {
            resWrap.optionsPerRow = dfdConfigs[0].Options_per_row__c;
            resWrap.linksPerOption = dfdConfigs[0].Links_per_Option__c;
            resWrap.optionLinkFontSize = dfdConfigs[0].In_Option_Link_font_size__c;
            resWrap.optionFontSize = dfdConfigs[0].Option_font_size__c;
            resWrap.rootRecordId = dfdConfigs[0].Root_Option_RecordId__c;
        }   
        return resWrap;
    }
    @AuraEnabled
    public static UserLoginWrapper getUserLoginInfo()
    {

        // UserInfo.getUserName();0DBQ10000000zQ5OAI
        //Id communityId = Network.getNetworkId();isGuestUser()
       // return Network.getLoginUrl(Network.getNetworkId());
       UserLoginWrapper usrWrap = new UserLoginWrapper();
       if(Auth.CommunitiesUtil.isGuestUser())
       {
           usrWrap.isGuestUser = true;
           usrWrap.loginURL = Network.getLoginUrl(Network.getNetworkId());
       }
       else
       {
           usrWrap.isGuestUser = false;
       }
        return usrWrap;
        //return Network.getNetworkId();
    }

    public class ResultWrapper
    {
        @AuraEnabled public String rootRecordId {get; set;}
        @AuraEnabled public Decimal optionsPerRow {get; set;}
        @AuraEnabled public Decimal linksPerOption {get; set;}
        @AuraEnabled public Decimal optionLinkFontSize {get; set;}
        @AuraEnabled public Decimal optionFontSize {get; set;}
        @AuraEnabled public List<Option__c> optionRecords {get; set;}
    }

    public class UserLoginWrapper
    {
        @AuraEnabled public String loginURL {get; set;}
        @AuraEnabled public Boolean isGuestUser {get; set;}
    }    
}