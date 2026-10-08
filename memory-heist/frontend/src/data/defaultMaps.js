export const DEFAULT_MAPS = [
  {
    "levelNumber": 1,
    "name": "Training Vault",
    "description": "Infiltrate the training vault. Observe guard patrol timings, secure the brass key, unlock the vault door, and grab the diamond.",
    "difficulty": "EASY",
    "width": 10,
    "height": 10,
    "memorizeTimeSeconds": 12,
    "timeLimitSeconds": 45,
    "grid": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        6,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        2,
        0,
        4,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        0,
        1,
        1
      ],
      [
        1,
        0,
        3,
        0,
        1,
        1,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        5,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "entrance": {
      "x": 1,
      "y": 1
    },
    "key": {
      "x": 2,
      "y": 7
    },
    "door": {
      "x": 5,
      "y": 2
    },
    "diamond": {
      "x": 7,
      "y": 2
    },
    "exit": {
      "x": 8,
      "y": 8
    },
    "guards": [
      {
        "id": "guard-1",
        "patrolPath": [
          {
            "x": 3,
            "y": 5
          },
          {
            "x": 4,
            "y": 5
          },
          {
            "x": 5,
            "y": 5
          },
          {
            "x": 6,
            "y": 5
          },
          {
            "x": 5,
            "y": 5
          },
          {
            "x": 4,
            "y": 5
          }
        ],
        "moveIntervalMs": 800,
        "initialFacing": "RIGHT",
        "visionRange": 3
      }
    ]
  },
  {
    "levelNumber": 2,
    "name": "Office After Hours",
    "description": "Corporate offices after midnight. Two security guards patrol the corridors. Avoid crossing illuminated lines of sight.",
    "difficulty": "MEDIUM",
    "width": 12,
    "height": 12,
    "memorizeTimeSeconds": 10,
    "timeLimitSeconds": 55,
    "grid": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        6,
        0,
        0,
        1,
        1,
        1,
        1,
        0,
        0,
        5,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1
      ],
      [
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1
      ],
      [
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1
      ],
      [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1
      ],
      [
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        2,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        1,
        0,
        4,
        0,
        1
      ],
      [
        1,
        0,
        3,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "entrance": {
      "x": 1,
      "y": 1
    },
    "key": {
      "x": 2,
      "y": 9
    },
    "door": {
      "x": 9,
      "y": 7
    },
    "diamond": {
      "x": 9,
      "y": 8
    },
    "exit": {
      "x": 10,
      "y": 1
    },
    "guards": [
      {
        "id": "guard-1",
        "patrolPath": [
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 6,
            "y": 2
          },
          {
            "x": 8,
            "y": 2
          },
          {
            "x": 6,
            "y": 2
          }
        ],
        "moveIntervalMs": 750,
        "initialFacing": "RIGHT",
        "visionRange": 3
      },
      {
        "id": "guard-2",
        "patrolPath": [
          {
            "x": 5,
            "y": 6
          },
          {
            "x": 7,
            "y": 6
          },
          {
            "x": 8,
            "y": 6
          },
          {
            "x": 7,
            "y": 6
          }
        ],
        "moveIntervalMs": 700,
        "initialFacing": "RIGHT",
        "visionRange": 3
      }
    ]
  },
  {
    "levelNumber": 3,
    "name": "Museum Wing",
    "description": "Symmetrical museum halls with intersecting patrol routes. Time your movement between display corridors carefully.",
    "difficulty": "HARD",
    "width": 14,
    "height": 14,
    "memorizeTimeSeconds": 9,
    "timeLimitSeconds": 65,
    "grid": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        6,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        2,
        4,
        0,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        3,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "entrance": {
      "x": 1,
      "y": 1
    },
    "key": {
      "x": 1,
      "y": 11
    },
    "door": {
      "x": 6,
      "y": 6
    },
    "diamond": {
      "x": 7,
      "y": 6
    },
    "exit": {
      "x": 12,
      "y": 12
    },
    "guards": [
      {
        "id": "guard-1",
        "patrolPath": [
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 6,
            "y": 4
          },
          {
            "x": 9,
            "y": 4
          },
          {
            "x": 9,
            "y": 9
          },
          {
            "x": 6,
            "y": 9
          },
          {
            "x": 3,
            "y": 9
          }
        ],
        "moveIntervalMs": 680,
        "initialFacing": "RIGHT",
        "visionRange": 3
      },
      {
        "id": "guard-2",
        "patrolPath": [
          {
            "x": 12,
            "y": 3
          },
          {
            "x": 12,
            "y": 6
          },
          {
            "x": 12,
            "y": 9
          },
          {
            "x": 12,
            "y": 6
          }
        ],
        "moveIntervalMs": 700,
        "initialFacing": "DOWN",
        "visionRange": 3
      }
    ]
  },
  {
    "levelNumber": 4,
    "name": "Archive Basement",
    "description": "Deep underground repository with dense shelving units and 3 patrol units. Memorize the dead ends to avoid getting trapped.",
    "difficulty": "EXPERT",
    "width": 16,
    "height": 16,
    "memorizeTimeSeconds": 8,
    "timeLimitSeconds": 75,
    "grid": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        6,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        3,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        2,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        0,
        4,
        0,
        1
      ],
      [
        1,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "entrance": {
      "x": 1,
      "y": 1
    },
    "key": {
      "x": 14,
      "y": 3
    },
    "door": {
      "x": 12,
      "y": 12
    },
    "diamond": {
      "x": 13,
      "y": 13
    },
    "exit": {
      "x": 1,
      "y": 14
    },
    "guards": [
      {
        "id": "guard-1",
        "patrolPath": [
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 6,
            "y": 4
          },
          {
            "x": 8,
            "y": 4
          },
          {
            "x": 6,
            "y": 4
          }
        ],
        "moveIntervalMs": 620,
        "initialFacing": "RIGHT",
        "visionRange": 3
      },
      {
        "id": "guard-2",
        "patrolPath": [
          {
            "x": 8,
            "y": 7
          },
          {
            "x": 8,
            "y": 9
          },
          {
            "x": 8,
            "y": 12
          },
          {
            "x": 8,
            "y": 9
          }
        ],
        "moveIntervalMs": 600,
        "initialFacing": "DOWN",
        "visionRange": 3
      },
      {
        "id": "guard-3",
        "patrolPath": [
          {
            "x": 11,
            "y": 10
          },
          {
            "x": 13,
            "y": 10
          },
          {
            "x": 13,
            "y": 7
          },
          {
            "x": 11,
            "y": 7
          }
        ],
        "moveIntervalMs": 650,
        "initialFacing": "RIGHT",
        "visionRange": 3
      }
    ]
  },
  {
    "levelNumber": 5,
    "name": "The Grand Heist",
    "description": "The ultimate master infiltration. Infiltrate the Security Terminal (💻) on the west wing to trigger an EMP blackout & thermal radar. Deploy tactical Smoke Decoys (💨) to slip past synchronized patrols.",
    "difficulty": "MASTER",
    "width": 18,
    "height": 18,
    "memorizeTimeSeconds": 14,
    "timeLimitSeconds": 100,
    "grid": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        6,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        3,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        7,
        1,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        4,
        0,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "entrance": {
      "x": 1,
      "y": 1
    },
    "key": {
      "x": 15,
      "y": 3
    },
    "door": {
      "x": 8,
      "y": 8
    },
    "diamond": {
      "x": 11,
      "y": 8
    },
    "terminal": {
      "x": 1,
      "y": 8
    },
    "exit": {
      "x": 16,
      "y": 16
    },
    "guards": [
      {
        "id": "guard-1",
        "patrolPath": [
          { "x": 4, "y": 4 },
          { "x": 5, "y": 4 },
          { "x": 6, "y": 4 },
          { "x": 7, "y": 4 },
          { "x": 8, "y": 4 },
          { "x": 9, "y": 4 },
          { "x": 10, "y": 4 },
          { "x": 11, "y": 4 },
          { "x": 12, "y": 4 },
          { "x": 13, "y": 4 },
          { "x": 12, "y": 4 },
          { "x": 11, "y": 4 },
          { "x": 10, "y": 4 },
          { "x": 9, "y": 4 },
          { "x": 8, "y": 4 },
          { "x": 7, "y": 4 },
          { "x": 6, "y": 4 },
          { "x": 5, "y": 4 }
        ],
        "moveIntervalMs": 650,
        "initialFacing": "RIGHT",
        "visionRange": 3
      },
      {
        "id": "guard-2",
        "patrolPath": [
          { "x": 14, "y": 6 },
          { "x": 14, "y": 7 },
          { "x": 14, "y": 8 },
          { "x": 14, "y": 9 },
          { "x": 14, "y": 10 },
          { "x": 14, "y": 11 },
          { "x": 14, "y": 12 },
          { "x": 14, "y": 11 },
          { "x": 14, "y": 10 },
          { "x": 14, "y": 9 },
          { "x": 14, "y": 8 },
          { "x": 14, "y": 7 }
        ],
        "moveIntervalMs": 680,
        "initialFacing": "DOWN",
        "visionRange": 3
      },
      {
        "id": "guard-3",
        "patrolPath": [
          { "x": 12, "y": 13 },
          { "x": 11, "y": 13 },
          { "x": 10, "y": 13 },
          { "x": 9, "y": 13 },
          { "x": 8, "y": 13 },
          { "x": 7, "y": 13 },
          { "x": 6, "y": 13 },
          { "x": 5, "y": 13 },
          { "x": 6, "y": 13 },
          { "x": 7, "y": 13 },
          { "x": 8, "y": 13 },
          { "x": 9, "y": 13 },
          { "x": 10, "y": 13 },
          { "x": 11, "y": 13 }
        ],
        "moveIntervalMs": 660,
        "initialFacing": "LEFT",
        "visionRange": 3
      },
      {
        "id": "guard-4",
        "patrolPath": [
          { "x": 3, "y": 11 },
          { "x": 3, "y": 10 },
          { "x": 3, "y": 9 },
          { "x": 3, "y": 8 },
          { "x": 3, "y": 7 },
          { "x": 3, "y": 6 },
          { "x": 3, "y": 5 },
          { "x": 3, "y": 6 },
          { "x": 3, "y": 7 },
          { "x": 3, "y": 8 },
          { "x": 3, "y": 9 },
          { "x": 3, "y": 10 }
        ],
        "moveIntervalMs": 680,
        "initialFacing": "UP",
        "visionRange": 3
      }
    ]
  }
];
