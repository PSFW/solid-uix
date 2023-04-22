import {initLibraries, localWebid, str2node, str2stm, ensureLibraries, getNodeFromFieldValue, curie} from './utils';

let mockFetchPromise = new Promise((resolve, reject) => { 
  resolve();
});
global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);

test('localWebId method is defined', () => {
  expect(localWebid).toBeDefined();
});

test('localWebid returns the value of webId if it is truthy', async () => {
  window.SolidAppContext = {
    "webId":"https://example.pod.provider/profile/card#me"
  };

  expect(await localWebid()).toBe('https://example.pod.provider/profile/card#me');
});

test('localWebid returns a default webid if webId is falsey and the request is successful', async () => {
  window.SolidAppContext = {
    "webId":""
  };
  let mockFetchPromise = new Promise((resolve, reject) => { 
    resolve({"status":200});
  });
  global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);

  expect(await localWebid()).toBe('http://localhost/profile/card#me');
});

test('localWebid returns a default webid if webId is falsey and the request is unsuccessful', async () => {
  window.SolidAppContext = {
    "webId":""
  };
  let mockFetchPromise = new Promise((resolve, reject) => { 
    resolve({"status":300});
  });
  global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);

  expect(await localWebid()).toBe(undefined);
});

test('str2node method is defined', () => {
  expect(str2node).toBeDefined();
});

test('str2node returns a blank string if "string" argument is falsey', () => {
  let actual = str2node(undefined,undefined);
  expect(actual).toBe("");
});

test('str2node returns a null if "string" argument equals "*"', () => {
  let actual = str2node("*",undefined);
  expect(actual).toBe(null);
});

test('str2node returns undefined if "string" argument starts with "<"', async () => {
  await initLibraries();

  let actual = str2node("<",undefined);
  expect(actual).toEqual(undefined);
});

test('str2node returns undefined value, if "string" starts with "<" and "baseUrl" is a blank string', async () => {
  await initLibraries();

  let actual = str2node("<","");
  expect(actual).toEqual(undefined);
});

test('str2node returns a NamedNode value, if "string" starts with "<", "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("<https://example2.com/#unique-id",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example2.com/#unique-id"});
});

test('str2node returns a NamedNode value, if "string" starts with "<" and ends with ">" (triple format), "baseUrl" is undefined', async () => {
  await initLibraries();

  let actual = str2node("<https://example2.com/#unique-id>",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example2.com/#unique-id"});
});

test('str2node returns a NamedNode value preserving all but the first less-than, if "string" starts with "<" and "baseUrl" is undefined', async () => {
  // ToDo: This actually highlights a bug, we should replace all < with '', as < is not valid in a URI - see https://stackoverflow.com/a/7109208
  await initLibraries();

  let actual = str2node("<https://example2.com/#unique-id<1<",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example2.com/#unique-id<1<"});
});

test('str2node returns a NamedNode value preserving all but the last greater-than, if "string" starts with "<" and "baseUrl" is undefined', async () => {
  // ToDo: This actually highlights a bug, we should replace all > with '', as > is not valid in a URI - see https://stackoverflow.com/a/7109208
  await initLibraries();

  let actual = str2node("<https://example2.com/#unique-id<>1",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example2.com/#unique-id<>1"});
});

test('str2node returns a NamedNode value of type, if "string" argument equals "a"', async () => {
  await initLibraries();

  let actual = str2node("a",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"});
});

test('str2node returns undefined value, if "string" starts with ":" and "baseUrl" is undefined', async () => {
  await initLibraries();

  let actual = str2node(":",undefined);
  expect(actual).toEqual(undefined);
});

test('str2node returns undefined value, if "string" starts with ":" and "baseUrl" is a blank string', async () => {
  await initLibraries();

  let actual = str2node(":","");
  expect(actual).toEqual(undefined);
});

test('str2node returns a NamedNode value, if "string" starts with ":" and "baseUrl" is a URI string', async () => {
  await initLibraries();

  let actual = str2node(":unique-id","https://example.com/");
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example.com/#unique-id"});
});

test('str2node returns a NamedNode value preserving all but the first colon, if "string" starts with ":" and "baseUrl" is a URI string', async () => {
  await initLibraries();

  let actual = str2node(":unique-id:1:","https://example.com/");
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "https://example.com/#unique-id:1:"});
});

test('str2node returns a NamedNode value, if "string" starts with "bk:", "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("bk:unique-id",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "http://www.w3.org/2002/01/bookmark#unique-id"});
});

test('str2node returns an undefined value, if "string" contains but does not start with "bk:", "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("unique-idbk:",undefined);
  expect(actual).toEqual(undefined);
});

test('str2node returns a NamedNode value, if "string" starts with a known vocabulary prefix and contains ":" but does not start with ":" or "http:" or "chrome:", "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("geo:lat",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "http://www.w3.org/2003/01/geo/wgs84_pos#lat"});
});

test('str2node returns an undefined value, if "string" starts with https and contains ":" but does not start with ":" or "http:" or "chrome:", "baseUrl" is ignored', async () => {
  // ToDo: This may highlight a bug, we should be checking for the presence of https: at the start of the string too, as https is not a valid vocab namespace prefix, but it may be a URI being used to represent an RDF identifier (for example if <http://www.w3.org/2003/01/geo/wgs84_pos#lat> were to migrate to <https://www.w3.org/2003/01/geo/wgs84_pos#lat>, this would currently break).
  await initLibraries();

  let actual = str2node("https://example2.com",undefined);
  expect(actual).toEqual(undefined);
});

test('str2node returns a NamedNode value, if "string" starts with http:, "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("http://www.w3.org/2003/01/geo/wgs84_pos#lat",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "http://www.w3.org/2003/01/geo/wgs84_pos#lat"});
});

test('str2node returns a NamedNode value, if "string" starts with chrome:, "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("chrome://newtab",undefined);
  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "chrome://newtab"});
});

test('str2node returns a LiteralNode value, if "string" is a literal forcing the call to $rdf.sym to fail, "baseUrl" is ignored', async () => {
  await initLibraries();

  let actual = str2node("hello world",undefined);
  expect(actual).toEqual({
    "classOrder": 1,
    "datatype": {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "http://www.w3.org/2001/XMLSchema#string"
    },
    "isVar": 0,
    "language": "",
    "termType": "Literal",
    "value": "hello world"
  });
});

test('str2stm returns a value, if "querystring" contains a turtle triple, "source" is chrome session string', async () => {
  // ToDo: This highlights three potential bugs 1) returned object literal contains speechmarks, 2) the fullstop 3) source can be undefined or blank string and throw an error
  await initLibraries();

  let actual = str2stm("<http://example.org/subject1> <http://example.org/predicate1> \"object1\" .","chrome:theSession");
  expect(actual).toEqual({
    "graph": {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "chrome:theSession",
    },
    "object":  {
      "classOrder": 1,
      "classOrder": 1,
    "datatype":  {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "http://www.w3.org/2001/XMLSchema#string",
    },
    "isVar": 0,
    "language": "",
    "termType": "Literal",
     "value": "\"object1\" .",
  },
   "predicate": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/predicate1",
   },
   "subject": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/subject1",
   }
  });
});

test('str2stm returns a value, if "querystring" contains a triple with preceding whitespace, "source" is chrome session string', async () => {
  await initLibraries();

  let actual = str2stm("  <http://example.org/subject1> <http://example.org/predicate1> \"object1\"","chrome:theSession");
  expect(actual).toEqual({
    "graph": {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "chrome:theSession",
    },
    "object":  {
      "classOrder": 1,
      "classOrder": 1,
    "datatype":  {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "http://www.w3.org/2001/XMLSchema#string",
    },
    "isVar": 0,
    "language": "",
    "termType": "Literal",
     "value": "\"object1\"",
  },
   "predicate": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/predicate1",
   },
   "subject": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/subject1",
   }
  });
});

test('str2stm returns a value, if "querystring" contains a triple with postceding whitespace, "source" is chrome session string', async () => {
  await initLibraries();

  let actual = str2stm("<http://example.org/subject1> <http://example.org/predicate1> \"object1\"  ","chrome:theSession");
  expect(actual).toEqual({
    "graph": {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "chrome:theSession",
    },
    "object":  {
      "classOrder": 1,
      "classOrder": 1,
    "datatype":  {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "http://www.w3.org/2001/XMLSchema#string",
    },
    "isVar": 0,
    "language": "",
    "termType": "Literal",
     "value": "\"object1\"",
  },
   "predicate": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/predicate1",
   },
   "subject": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/subject1",
   }
  });
});

test('str2stm returns a value, if "querystring" contains a triple with an internationalised literal object, "source" is chrome session string', async () => {
  // ToDo: This could highlight a bug, is this parsing of the string literal correct when given the internationalised label?
  await initLibraries();

  let actual = str2stm("<http://example.org/subject1> <http://example.org/predicate1> \"object1\"@en-GB","chrome:theSession");
  expect(actual).toEqual({
    "graph": {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "chrome:theSession",
    },
    "object":  {
      "classOrder": 1,
      "classOrder": 1,
    "datatype":  {
      "classOrder": 5,
      "termType": "NamedNode",
      "value": "http://www.w3.org/2001/XMLSchema#string",
    },
    "isVar": 0,
    "language": "",
    "termType": "Literal",
     "value": "\"object1\"@en-GB",
  },
   "predicate": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/predicate1",
   },
   "subject": {
     "classOrder": 5,
     "termType": "NamedNode",
     "value": "http://example.org/subject1",
   }
  });
});

test('getNodeFromFieldValue returns undefined, if "fieldSelector" contains a value that exists on the DOM (as a SELECT element), "key" is ignored', async () => {
  await initLibraries();
  // ToDo: This seems to indicate a bug, this test throws an error, the code passes the entire OPTION element to the sym function, instead of passing the value of the OPTION element.
  const selectElement = document.createElement('select');

  const option1 = document.createElement('option');
  option1.value = 'option1';
  option1.text = 'Option 1';
  selectElement.appendChild(option1);
  
  const option2 = document.createElement('option');
  option2.value = 'option2';
  option2.text = 'Option 2';
  selectElement.appendChild(option2);
  
  const option3 = document.createElement('option');
  option3.value = 'option3';
  option3.text = 'Option 3';
  selectElement.appendChild(option3);

  selectElement.selectedIndex = 2;

  jest.spyOn(document, 'getElementById').mockReturnValue(selectElement);

  let node = getNodeFromFieldValue("#unique-id", undefined)

  expect(node).toBe(undefined);

  jest.restoreAllMocks();
});

test('getNodeFromFieldValue is called correctly, if "fieldSelector" is a value that contains a #, "key" is ignored', async () => {
  await initLibraries();
  const selectElement = document.createElement('select');

  const option1 = document.createElement('option');
  option1.value = 'option1';
  option1.text = 'Option 1';
  selectElement.appendChild(option1);
  
  const option2 = document.createElement('option');
  option2.value = 'option2';
  option2.text = 'Option 2';
  selectElement.appendChild(option2);
  
  const option3 = document.createElement('option');
  option3.value = 'option3';
  option3.text = 'Option 3';
  selectElement.appendChild(option3);

  selectElement.selectedIndex = 2;

  let getElementById = jest.spyOn(document, 'getElementById').mockReturnValue(selectElement);

  let node = getNodeFromFieldValue("#unique-id", undefined)

  expect(getElementById).toHaveBeenCalledWith("unique-id");

  jest.restoreAllMocks();
});

test('curie returns a NamedNode value, if "string" is a value that contains a : with a known rdf prefix before the colon', async () => {
  const string = 'rdfs:label';

  const actual = curie(string);

  expect(actual).toEqual({"classOrder": 5, "termType": "NamedNode", "value": "http://www.w3.org/2000/01/rdf-schema#label"});
});

test('ensureLibraries returns a value, if UI global is defined', async () => {
  global.UI = {
    ns:{},
    rdf:{},
    store:{}
  }

  let actual = await ensureLibraries();
  expect(actual).toEqual({
    ns:{},
    rdf:{},
    store:{}
  });
});