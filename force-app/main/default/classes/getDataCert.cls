public with sharing class getDataCert {
    @AuraEnabled(cacheable=true)
    public static List<Certification__c> getcert(){
        return [select Id,Name,Cert_Name__c,Comments__c from Certification__c];
    }
}
