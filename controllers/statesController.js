/*---------------------------------------------------------------------------------------
    Imported Data
---------------------------------------------------------------------------------------*/
const { json } = require('express/lib/response'); 
const State = require('../model/State');
const statesJSONData = require('../model/states.json');

/*---------------------------------------------------------------------------------------
    GET Request Functions 
---------------------------------------------------------------------------------------*/
const getAllStates = async (req, res) => {
    // Get contig value from query parameter 
    const { contig } = req.query;

    // Store list of states from statesJSONData as array
    let statesList = statesJSONData;

    // From statesList, return ONLY noncontiguous states
    if (contig === 'false') {
        statesList = statesJSONData.filter(st => st.code === 'AK' || st.code === 'HI');
        return res.json(statesList);
    }
    // From statesList, return ONLY contiguous states
    if (contig === 'true') {
        statesList = statesJSONData.filter(st => st.admission_number < 49);
        return res.json(statesList);
    }
    
    // Get all the state data documents from MongoDB
    const mongoStates = await State.find();

    // Loop through statesList array
    statesList.forEach(state => {
        // Attempt to find the state in MongoDB collection
        const stateExists = mongoStates.find(st => st.stateCode === state.code);
        // If the state exists, attach 'funfact' property to the state object
        if(stateExists) {
            let funfactArray = stateExists.funfacts;
            if (funfactArray.length !== 0) {
                state.funfacts = [...funfactArray]; 
            }
        }
    });
    res.json(statesList);
}

const getState = async (req, res) => {    
    // Get specified state from URL parameter
    const stateReq = req.params.state;

    // Find the specified state data from statesJSONData
    const stateData = statesJSONData.find(state => state.code === stateReq);

    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateData.code);
    
    if(stateExists) {
        let funfactArray = stateExists.funfacts;
        // If one or more funfacts exist, attach them
        if (funfactArray.length !== 0) {
            stateData.funfacts = [...funfactArray]; 
        }
    }
    res.json(stateData);
}

const getStateFunFact = async (req, res) => {
    // Get the state from the URL parameter
    const stateReq = req.params.state;

    // Find the specified state in statesJSONData
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether specified state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateData.code);
    
    // Get the array of fun facts from MongoDB
    const funfactArray = stateExists.funfacts;

    // If no funfacts exist, send an appropriate response
    if (!funfactArray.length) {
         return res.json({ "message": `No Fun Facts found for ${stateData.state}`});
    }
    
    // Generate a random number between 0 and array length
    let randomNum = Math.floor(Math.random()*funfactArray.length);
    
    // Get funfact at random index
    let funfact = funfactArray[randomNum];

    // Create a response with the random funfact
    res.json({ funfact });
}

const getStateCapital = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    const capital = stateData.capital_city;

    // Create a response with the state name and capital
    res.json({ state, capital });
}

const getStateNickname = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    const nickname = stateData.nickname;

    // Create a response with the state name and capital
    res.json({ state, nickname });
}

const getStatePopulation = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;

    // Convert population to int 
    const popInt = stateData.population;

    // Convert population to string and add commas
    const population = popInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Create a response with the state name and capital
    res.json({ state, population });
}

const getStateAdmission = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    const admitted = stateData.admission_date;

    // Create a response with the state name and capital
    res.json({ state, admitted });
}

/*---------------------------------------------------------------------------------------
    POST Request Functions 
---------------------------------------------------------------------------------------*/
const createStateFunFact = async (req, res) => {
    // Verify funfacts were included in request body
    if(!req.body.funfacts) {
        return res.status(400).json({"message": "State fun facts value required"});
    }
 
    // Get state code from URL parameter
    const stateCode = req.params.state;
    const funfacts = req.body.funfacts;

    // Verify funfacts in request body are passed in as array
    if (!(funfacts instanceof Array) || funfacts instanceof String) {  
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }

    // Find the requested state in MongoDB collection
    const foundState = await State.findOne({stateCode: stateCode});

    // If no existing array of funfacts for requested state, create a new document w/ request body parameters
    if (!foundState) {
        try {
            const result = await State.create({
                stateCode: stateCode,
                funfacts: funfacts
            });
            console.log(typeof result);
            res.status(201).json(result);
        }
        catch (err) {
            console.error(err);
        }
    }
    else {
        // If state has an existing array of funfacts, ADD the new funfacts to them (do NOT delete existing funfacts)
        let funfactArray = foundState.funfacts;
        funfactArray = funfactArray.push(...funfacts);
        const result = await foundState.save();
        res.status(201).json(result);
    }
}

/*---------------------------------------------------------------------------------------
    PATCH Request Functions 
---------------------------------------------------------------------------------------*/
const updateStateFunFact = async (req, res) => {
    // Verify index value was included in request body 
    if(!req.body.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    // Verify funfact value was included in request body (must be String type)
    if(!req.body.funfact || req.body.funfact instanceof Array) {
        return res.status(400).json({"message": "State fun fact value required"});
    }

    // Subtract 1 from index value to match up with correct index of the funfacts array in MongoDB
    const index = parseInt(req.body.index) - 1; 
    
    // Get requested state code from URL parameter
    const stateCode = req.params.state;
    
    // Get correspondning state name from statesJSONData (to use for invalid input responses)
    const stateData = statesJSONData.find(state => state.code === stateCode);
    const stateName = stateData.state;
    
    // Get funfact from request body to use to update existing funfact
    const funfact = req.body.funfact;

    // Find the requested state in MongoDB collection
    const foundState = await State.findOne({stateCode: stateCode});

    // Get funfacts array for requested state
    let funfactArray = foundState.funfacts;

    // If no funfacts exist for requested state, send an appropriate response
    if(!funfactArray.length) {
        return res.status(400).json({"message": `No Fun Facts found for ${stateName}`});
    }
    // If no funfacts exist at the specified index, send an appropriate response
    if(!funfactArray[index]) {
        return res.status(400).json({"message": `No Fun Fact found at that index for ${stateName}`});
    }

    // Set the element at the specified index to the new value
    funfactArray[index] = funfact;

    // Save the record and respond with the result received from the model
    const result = await foundState.save();
    res.status(201).json(result);
}

/*---------------------------------------------------------------------------------------
    DELETE Request Functions 
---------------------------------------------------------------------------------------*/
const deleteStateFunFact = async (req, res) => {
    // Verify index value was included in request body 
    if(!req.body.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    
    // Subtract 1 from index value to match up with correct index of the funfacts array in MongoDB
    const index = parseInt(req.body.index) - 1;

    // Get requested state code from URL parameter
    const stateCode = req.params.state;

    // Get correspondning state name from statesJSONData (to use for invalid input responses)
    const stateData = statesJSONData.find(state => state.code === stateCode);
    const stateName = stateData.state;
    
    // Find the requested state in MongoDB collection
    const foundState = await State.findOne({stateCode: stateCode});

    // Get funfacts array for requested state
    let funfactArray = foundState.funfacts;

    // If no funfacts exist for requested state, send an appropriate response
    if(!funfactArray.length) {
        return res.status(400).json({"message": `No Fun Facts found for ${stateName}`});
    }
    // If no funfacts exist at the specified index, send an appropriate response
    if(!funfactArray[index]) {
        return res.status(400).json({"message": `No Fun Fact found at that index for ${stateName}`});
    }

    // Splice and remove specified index from funfacts
    funfactArray.splice(index, 1);

    // Save the record and respond with the result received from the model
    const result = await foundState.save();
    res.status(201).json(result); 
}

/*---------------------------------------------------------------------------------------
    Exported Functions 
---------------------------------------------------------------------------------------*/
module.exports = {
    getAllStates, 
    getState, 
    getStateFunFact,
    getStateCapital,
    getStateNickname, 
    getStatePopulation,
    getStateAdmission,
    createStateFunFact,
    updateStateFunFact,
    deleteStateFunFact
}