var mongodb = require('mongodb'),
    ObjectID = require('mongodb').ObjectID,
	assert = require('assert'),
	Q   = require('q'),
	url = 'mongodb://localhost:27017/sign?maxPoolSize=1',
	db;
	
function MongoModel(){
	
	mongodb.MongoClient.connect(url, function(err, database) {
		if(err) throw err;
		db = database;
	});
	
	this.ConvertObject = function(params){
		return new ObjectID(params)
	}
	
	this.InsertToDb = function(table,contents){
		var deferred = Q.defer();
		db.collection(table).insert(contents,function(err,data){
			if(err) deferred.resolve(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	}
	
	this.UpdateOnce = function(table,condition,contents){
		var deferred = Q.defer();
		db.collection(table).update(condition,{$set:contents},function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	};
	
	this.UpdateAll = function(table,condition,contents){
		var deferred = Q.defer();
		db.collection(table).update(condition,{$set:contents},{multi:true},function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	};
	
	this.UpsertOnce = function(table,condition,contents){
		var deferred = Q.defer();
		db.collection(table).update(condition,{$set:contents},{upsert:true},function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	};
	
	this.PushArray = function(table,condition,contents){
		var deferred = Q.defer();
		db.collection(table).update(condition,{$addToSet:contents},{upsert:true},function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	};
	
	this.FindInDb = function(table,condition,sortcondition){
		var deferred = Q.defer();
		db.collection(table).find(condition).sort(sortcondition).toArray(function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	};
	
	this.FindInDbAndCount = function(table,condition){
		var deferred = Q.defer();
		db.collection(table).count(condition,function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	}
	
	this.RemoveInDb = function(table,condition){
		var deferred = Q.defer();
		db.collection(table).remove(condition,function(err,data){
			if(err) deferred.reject(err);
			else deferred.resolve(data);
		})
		return deferred.promise;
	}
	
	this.Close = function(){
		console.log(db)
		db.close();
	}
	
}


 
// Connection URL 

// Use connect method to connect to the Server 

module.exports = MongoModel;