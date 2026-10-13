{
  "characters": [
    {
      "name": "romeo",
      "called": "Romeo",
      "pronoun": "he",
      "physical": ["beautiful"],
      "personality": ["good", "determined"],
      "movement": ["graceful"]
    },
    {
      "name": "juliet",
      "called": "Juliet",
      "pronoun": "she",
      "physical": ["beautiful"],
      "personality": ["good", "determined"],
      "movement": ["graceful"]
    },
    {
      "name": "romeos-family",
      "called": "Romeo's family",
      "pronoun": "they",
      "physical": ["powerful"],
      "personality": ["mean", "stubborn"],
      "movement": []
    },
    {
      "name": "juliets-family",
      "called": "Juliet's family",
      "pronoun": "they",
      "physical": ["powerful"],
      "personality": ["mean", "stubborn"],
      "movement": []
    },
    {
      "name": "tybalt",
      "called": "Tybalt",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["mean", "brazen"],
      "movement": []
    }
  ],
  "main": "romeo",
  "relationships": [
    {"from": "romeo", "to": "juliet", "how": ["loves"]},
    {"from": "juliet", "to": "romeo", "how": ["loves"]},
    {"from": "romeos-family", "to": "juliets-family", "how": ["hates"]},
    {"from": "juliets-family", "to": "romeos-family", "how": ["hates"]},
    {"from": "tybalt", "to": "romeo", "how": ["hates"]}
  ],
  "scenes": [
    {
      "name": "young-lovers",
      "title": "Young Lovers",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "romeo"},
          {"kind": "establish-personality", "who": "juliet"}
        ],
        [
          {"kind": "establish-relationship", "from": "romeo", "to": "juliet"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "juliet",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "kept-apart",
      "title": "Kept Apart",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "prevents", "who": "romeos-family", "meets": ["romeo", "juliet"]},
          {"kind": "prevents", "who": "juliets-family", "meets": ["romeo", "juliet"]}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "romeo",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "juliet",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "tybalts-fight",
      "title": "Tybalt's Fight",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "tybalt"}
        ],
        [
          {"kind": "hurts", "who": "tybalt", "whom": "romeo"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tybalt",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "romeo",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "together-in-sadness",
      "title": "Together in Sadness",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "alone", "who": "romeo", "whom": "juliet"}
        ],
        [
          {"kind": "getting-it-on", "who": "romeo", "whom": "juliet"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "romeo",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "juliet",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "romeo-and-juliet-film",
    "variety": "medium",
    "complexity": "medium",
    "originality": "low",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["kept-apart", "together-in-sadness"],
    "relationships": [
      {"from": "romeo", "to": "juliet"},
      {"from": "juliet", "to": "romeo"}
    ]
  }
}