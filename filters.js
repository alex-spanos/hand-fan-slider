var col = [{
	name: 'Alex',
	gender: 'male',
	age: 36
}, {
	name: 'Rallou',
	gender: 'female',
	age: 32
}, {
	name: 'Alexakos',
	gender: 'male',
	age: 6
}, {
	name: 'Rallounaki',
	gender: 'female',
	age: 2
}];

function test_males_30_to_40_filter_1() {
	handleAssertion(filterCollection_1(col));
}

function test_males_30_to_40_filter_2() {
	handleAssertion(filterCollection_2(col));
}

function handleAssertion(results) {
	if (results.length == 1 && results[0].name == 'Alex')
		console.log('Great success!');
	else console.log('Failure');
}

function filterCollection_1(collection) {
	if (!collection.constructor === Array) return [];
	return collection.filter(checkItem);
}

function filterCollection_2(collection) {
	if (!collection.constructor === Array) return [];
	
	var len = collection.length,
		results = new Array(len)
		counter = 0;
	
	for (var index = 0; index < len; ++index) {
		var item = collection[index];
		
		if (checkItem(item)) {
			results[counter] = item;
			counter++;
		}
	}
	results.length = counter;
	
	return results;
}

function checkItem(item) {
	if (!item) return false;
	var gender = item.gender;
	
	if (gender && (typeof gender == 'string' || gender instanceof String) &&
		gender.toLowerCase() == 'male') {
		var age = item.age;
		
		if (age && !Number.isNaN(age) &&
			age > 30 && age < 40) {
			return true;
		}
	}
	return false;
}