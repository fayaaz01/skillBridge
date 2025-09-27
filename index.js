// CRITICAL: We use the DocumentClient for simpler data handling
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(); 
const TABLE_NAME = 'StudentBarterData'; 

// Define the two users and their needs/offers for the core demonstration
const USER_A_USERNAME = 'FayaazMuhammed';
const USER_A_NEED = 'Career Path Navigation';
const USER_A_OFFER = 'Digital Portfolio Creation';

exports.handler = async (event) => {
    // Standard CORS Headers (Required for Amplify/S3 Frontend)
    const responseHeaders = {
        "Access-Control-Allow-Headers" : "Content-Type,Authorization",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET,OPTIONS"
    };

    try {
        // 1. Fetch ALL profiles from DynamoDB (simple for a hackathon MVP)
        const params = { TableName: TABLE_NAME };
        const result = await dynamodb.scan(params).promise();
        const all_profiles = result.Items;

        // 2. Execute the Two-Way Reciprocal Match Algorithm
        
        // Find a profile (USER_B, which is John) that satisfies BOTH conditions:
        const match_data = all_profiles.find(userB => 
            // Condition 1: USER_B is NOT USER_A
            userB.Username !== USER_A_USERNAME &&

            // Condition 2: USER_B offers the skill USER_A needs (The FIRST leg)
            userB.SkillsOffered && userB.SkillsOffered.includes(USER_A_NEED) &&
            
            // Condition 3: USER_B needs the skill USER_A offers (The SECOND leg, Reciprocity)
            userB.SkillsNeeded && userB.SkillsNeeded.includes(USER_A_OFFER)
        );

        if (match_data) {
            // SUCCESS: Return the matched user (John Smith)
            return {
                statusCode: 200,
                headers: responseHeaders,
                body: JSON.stringify({
                    message: 'Perfect Barter Match Found!', 
                    match: {
                        Username: match_data.Username,
                        Offers: match_data.SkillsOffered,
                        TrustScore: match_data.TrustScore 
                    }
                })
            };
        }
        
        // NO MATCH FOUND
        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'No exact reciprocal match found.' })
        };

    } catch (error) {
        console.error("Lambda Error:", error);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ error: `Internal server error: ${error.message}` })
        };
    }
};
