@isTest
public class DFD_ServicesMenuControllerTest {
    
    @isTest
    public static void testMethod1()
    {
        Option__c newOption = new Option__c();
        newOption.Authorized_Login_Text__c ='Test';
        newOption.Component_Active__c = true;
        newOption.Component_Button_Name__c='Test Button';
        newOption.Component_Mode__c = 'Embedded';
        newOption.Component_Name__c = 'Test Component';
        newOption.Component_Type__c = 'LWC';
        newOption.Description__c = 'Test Description';
        newOption.External_URL__c = 'https://google.com';
        newOption.Header__c = 'Test Header';
        newOption.In_Option_Description__c = 'Test';
        newOption.Login_Type__c = 'Authorized';
        newOption.Right_Section_Text__c = 'Test Service';
        newOption.Option_Name__c = 'Test Service';
        newOption.Status__c = 'Active';
        newOption.Sub_Header__c = 'True';
        Test.startTest();
        insert newOption;
        DFD_ServicesMenuController.getOptionsMap();
         DFD_ServicesMenuController.getUserLoginInfo();
        dfdTestLwcController.getOptionRecord(newOption.Id);
        dfdTestLwcController.createCase('Test','Test','Web','New','Low','Question');
         Test.stopTest();
    }

}