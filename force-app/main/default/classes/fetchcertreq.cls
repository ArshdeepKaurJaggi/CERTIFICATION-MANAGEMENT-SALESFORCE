public with sharing class fetchcertreq {
    @AuraEnabled(Cacheable = true)
    public static List<Certification_Request__c> getCertRList(){
        return [SELECT Id, Name, Due_Date__c, Status__c, Comments__c,Email_Recipient__c, Certification__r.Cert_Name__c,Employee__r.Emp_Name__c,Voucher__r.Voucher_Name__c FROM Certification_Request__c ORDER BY Id ];
    }
}