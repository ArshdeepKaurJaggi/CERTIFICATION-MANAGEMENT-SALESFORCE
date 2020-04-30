public with sharing class getVoucherListNew {

    @AuraEnabled(Cacheable = true)
    public static List<Voucher__c> getVouList(){
        return [ SELECT Active__c,Id,Name,Validity__c,Voucher_Cost__c,Voucher_Name__c, Certification__r.Cert_Name__c FROM Voucher__c ORDER BY Id ASC NULLS FIRST LIMIT 10 ];
    }
}