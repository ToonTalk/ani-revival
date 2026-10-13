{
  "characters": [
    {
      "name": "belle",
      "called": "Belle",
      "pronoun": "she",
      "physical": ["beautiful"],
      "personality": ["kind", "stubborn"],
      "movement": []
    },
    {
      "name": "beast",
      "called": "the Beast",
      "pronoun": "he",
      "physical": ["ugly", "physically-strong"],
      "personality": ["strong", "mean"],
      "movement": []
    },
    {
      "name": "father",
      "called": "Belle's father",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["weak", "kind"],
      "movement": []
    }
  ],
  "main": "belle",
  "relationships": [
    {
      "from": "beast",
      "to": "belle",
      "how": ["dominates", "hates"]
    },
    {
      "from": "belle",
      "to": "beast",
      "how": ["is-intolerant-of"]
    },
    {
      "from": "father",
      "to": "belle",
      "how": ["loves"]
    },
    {
      "from": "belle",
      "to": "father",
      "how": ["loves"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Belle and the Beast",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "belle"},
          {"kind": "establish-personality", "who": "beast"}
        ],
        [
          {"kind": "establish-relationship", "from": "beast", "to": "belle"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "belle",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "kept-apart",
      "title": "A Father Kept Apart",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "father"}
        ],
        [
          {"kind": "wants", "who": "father", "meets": ["father", "belle"]}
        ],
        [
          {"kind": "prevents", "who": "beast", "meets": ["father", "belle"]}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "father",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "growing-love",
      "title": "Belle Comes to Love the Beast",
      "mood": "hopeful",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "meets", "who": "belle", "whom": "beast"}
        ],
        [
          {
            "kind": "change-personality",
            "who": "beast",
            "from": ["mean"],
            "to": ["kind"],
            "causedBy": "belle"
          },
          {
            "kind": "change-relationship",
            "who": "belle",
            "whom": "beast",
            "from": ["is-intolerant-of"],
            "to": ["loves"],
            "causedBy": ""
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "belle",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "love-returned",
      "title": "The Beast Returns Her Love",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "beast"}
        ],
        [
          {"kind": "meets", "who": "beast", "whom": "belle"}
        ],
        [
          {
            "kind": "change-relationship",
            "who": "beast",
            "whom": "belle",
            "from": ["dominates", "hates"],
            "to": ["loves"],
            "causedBy": "belle"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "beast",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "happy-together",
      "title": "Belle and the Beast in Love",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "alone", "who": "belle", "whom": "beast"}
        ],
        [
          {"kind": "getting-it-on", "who": "belle", "whom": "beast"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "belle",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "beast",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "beauty-and-the-beast-film",
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
    "scenes": ["growing-love", "love-returned", "happy-together"],
    "relationships": [
      {"from": "belle", "to": "beast"},
      {"from": "beast", "to": "belle"}
    ]
  }
}