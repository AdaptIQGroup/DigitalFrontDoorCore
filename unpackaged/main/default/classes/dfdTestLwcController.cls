public without sharing class dfdTestLwcController {
    @AuraEnabled
    public static String createCase(String subject, String description, String origin,
                                    String status, String priority, String type)
    {
        Case cse = new Case();
        cse.Subject = subject;
        cse.Description = description;
        cse.Origin = origin;
        cse.Status = status;
        cse.Priority = priority;
        cse.Type = type;

        insert cse;
        Case cseNew = [SELECT id, CaseNumber FROM Case WHERE Id =:cse.Id];
        return cseNew.CaseNumber;

    }
    @AuraEnabled
    public static Option__c getOptionRecord(String recordId)
    {
        return [SELECT id,Option_Name__c FROM Option__c WHERE Id =:recordId];
    }

}