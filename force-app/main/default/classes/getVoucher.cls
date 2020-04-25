public with sharing class getVoucher {
    @AuraEnabled(cacheable=true)
    public static list<Voucher__c> getList(string searchKey) {
        string sTempSearchKey = '%' + searchKey + '%';
		
       // create contact list to store search result 
        list<Voucher__c> lst = new list<Voucher__c>();
     
	   // query contact records
        for(Voucher__c oVou : [Select id,Name,Voucher_Name__c
                            From Voucher__c
                            WHERE Voucher_Name__c LIKE : sTempSearchKey]){
           lst.add(oVou);
        }
		
       //If there are no records found with searchKey then, throw aura exception with a message
         if(lst.size() == 0){
            throw new AuraHandledException('No Record Found..'); 
         }
         
        return lst;
    }
}
