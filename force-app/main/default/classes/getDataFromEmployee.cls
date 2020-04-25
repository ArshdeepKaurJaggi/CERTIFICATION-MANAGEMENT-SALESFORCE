public with sharing class getDataFromEmployee {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getemp(){
        return [select Id,Name,Emp_Name__c,Emp_Email__c,Primary_Skill__c,Secondary_Skill__c,Experience__c,Comments__c from Employee__c];
    }
}
