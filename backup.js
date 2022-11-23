class Backup {
	// if you change this, it'll lose all track of all the save data's location. Only change in the very beginning if you think of a better key
  // the key in local storage, for the array that holds all the keys that've been used
  static listKey = "saveDataKeyList!@!";
  
  
  // saves parameter 2 under parameter 1 in local storage
	static save(key, data) {
  	// can't override the list of keys
  	if (key == this.listKey) {
    	console.error("Forbidden key name: " + key);
      return; // end it early
    }
    // stringify the data so it doesn't get badly automatically converted
  	data = JSON.stringify(data);
    // save it to local storage
	  localStorage.setItem(key, data);
    
    // ====== LOG KEY =======
    // get the keylist
    const keyList = Backup.getKeyList();
    // if the key's not in the list (it's not just being overwritten)
    if (!keyList.includes(key)) {
      // add the key name to the array
      keyList.push(key);
    }
    // resave the array to localStorage
    localStorage.setItem(this.listKey, JSON.stringify(keyList));
	} // end of save()
  
  
  
  // gets the value associated with the given key in local storage
  static retrieve(key) {
  	// can't accidentally get the value for the keyList
  	if (key == this.listKey) {
  		console.error("Forbidden key name: " + key);
  	  return; // end it early
  	}
    // gets the data from local storage
    let data = localStorage.getItem(key);
    // un-stringify it before returning it
    data = JSON.parse(data);
    return data;
  } // end of retrieve()
  
  
  
  // removes the key and associated data from local storage
  static remove(key) {
  	// can't remove the keyList
  	if (key == this.listKey) {
    	console.error("Forbidden key name: " + key);
      return; // end it early
    }
    // remove it from local storage
  	localStorage.removeItem(key);
    
    // remove the key from the keyList in localStorage
    // ======= UNLOG KEY =========
    // get the keylist
  	const keyList = Backup.getKeyList();
    // get the index of the key in the array
    const index = keyList.indexOf(key);
    // if it's in the array
    if (index > -1) {
    	// cut it out
    	keyList.splice(index, 1);
    }
    // resave the array to localStorage
    localStorage.setItem(this.listKey, JSON.stringify(keyList));
  } // end of remove()
  
  
  
  // returns the array of localStorage keys from localStorage
  static getKeyList() {
  	let keyList;
    // if it hasn't been created
  	if (localStorage.getItem(this.listKey) === null) {
    	// make it an empty array
    	keyList = [];
    // if it already exists
    } else {
    	// get the array from local storage
    	keyList = localStorage.getItem(this.listKey);
      // if it's nothing
      if (keyList == "") {
      	// make it an empty array, to be handled easier
      	keyList = [];
      // if there's stuff in it
      } else {
      	// un-stringify it
      	keyList = JSON.parse(keyList);
      }
      
    }
    // return it
    return keyList;
  } // end of getKeyList()
  
  
} // end of Backup
