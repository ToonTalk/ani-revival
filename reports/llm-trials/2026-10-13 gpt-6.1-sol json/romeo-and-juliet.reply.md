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
      "personality": ["mean", "brazen", "stubborn"],
      "movement": []
    }
  ],
  "main": "romeo",
  "relationships": [
    {"from": "romeo", "to": "juliet", "how": ["loves"]},
    {"from": "juliet", "to": "romeo", "how": ["loves"]},
    {"from": "romeos-family", "to": "juliets-family", "how": ["hates"]},
    {"from": "juliets-family", "to": "romeos-family", "how": ["hates"]},
    {"from": "romeos-family", "to": "romeo", "how": ["dominates"]},
    {"from": "juliets-family", "to": "juliet", "how": ["dominates"]},
    {"from": "tybalt", "to": "romeo", "how": ["hates"]}
  ],
  "scenes": [
    {
      "name": "in-love",
      "title": "In Love",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "romeo"},
          {"kind": "establish-personality", "who": "juliet"}
        ],
        [
          {"kind": "establish-relationship", "from": "romeo", "to": "juliet"},
          {"kind": "establish-relationship", "from": "juliet", "to": "romeo"}
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
      "name": "the-fight",
      "title": "The Fight",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [{"kind": "establish-personality", "who": "tybalt"}],
        [{"kind": "hurts", "who": "tybalt", "whom": "romeo"}],
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
      "name": "together-in-sorrow",
      "title": "Together in Sorrow",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "long",
      "steps": [
        [{"kind": "alone", "who": "romeo", "whom": "juliet"}],
        [{"kind": "getting-it-on", "who": "romeo", "whom": "juliet"}],
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
    "originality": "medium",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["kept-apart", "together-in-sorrow"],
    "relationships": [
      {"from": "romeo", "to": "juliet"},
      {"from": "juliet", "to": "romeo"}
    ]
  }
}