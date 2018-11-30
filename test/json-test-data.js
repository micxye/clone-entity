const parsedJsonData = {
    "entities": [
        {
            "entity_id": 3,
            "name": "EntityA"
        },
        {
            "entity_id": 5,
            "name": "EntityB"
        },
        {
            "entity_id": 7,
            "name": "EntityC",
            "description": "More details about entity C"
        },
        {
            "entity_id": 11,
            "name": "EntityD"
        }
    ],
    "links": [
        {
            "from": 3,
            "to": 5
        },
        {
            "from": 3,
            "to": 7
        },
        {
            "from": 5,
            "to": 7
        },
        {
            "from": 7,
            "to": 11
        }
    ]
};

const parsedCycleJsonData = {
    "entities": [
        {
            "entity_id": 3,
            "name": "EntityA"
        },
        {
            "entity_id": 5,
            "name": "EntityB"
        },
        {
            "entity_id": 7,
            "name": "EntityC",
            "description": "More details about entity C"
        },
        {
            "entity_id": 11,
            "name": "EntityD"
        }
    ],
    "links": [
        {
            "from": 3,
            "to": 5
        },
        {
            "from": 3,
            "to": 7
        },
        {
            "from": 5,
            "to": 7
        },
        {
            "from": 7,
            "to": 11
        },
        {
            "from": 11,
            "to": 5
        }
    ]
};

module.exports = { parsedJsonData, parsedCycleJsonData };
