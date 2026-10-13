{
  "characters": [
    {
      "name": "duckling",
      "called": "the ugly duckling",
      "pronoun": "he",
      "physical": ["ugly", "physically-weak"],
      "personality": ["shy", "good"],
      "movement": []
    },
    {
      "name": "ducks",
      "called": "the other ducks",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["mean", "unfriendly"],
      "movement": []
    },
    {
      "name": "swans",
      "called": "the swans",
      "pronoun": "they",
      "physical": ["beautiful", "elegant"],
      "personality": ["kind", "friendly"],
      "movement": ["graceful"]
    }
  ],
  "main": "duckling",
  "relationships": [
    {
      "from": "ducks",
      "to": "duckling",
      "how": ["hates", "dominates"]
    },
    {
      "from": "duckling",
      "to": "ducks",
      "how": ["is-tolerant-of"]
    },
    {
      "from": "swans",
      "to": "duckling",
      "how": ["is-helpful-towards", "is-polite-to"]
    },
    {
      "from": "duckling",
      "to": "swans",
      "how": ["is-grateful-to"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "The Ugly Duckling",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "duckling"},
          {"kind": "establish-personality", "who": "ducks"}
        ],
        [
          {"kind": "establish-relationship", "from": "ducks", "to": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "pushed-around",
      "title": "Pushed Around",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "pushes", "who": "ducks", "whom": "duckling"}
        ],
        [
          {"kind": "establish-relationship", "from": "duckling", "to": "ducks"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "lonely-winter",
      "title": "A Lonely Winter",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "long",
      "steps": [
        [
          {"kind": "wants", "who": "duckling", "meets": ["duckling", "swans"]}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "spring-welcome",
      "title": "A Welcome in Spring",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "swans"}
        ],
        [
          {"kind": "meets", "who": "duckling", "whom": "swans"}
        ],
        [
          {"kind": "establish-relationship", "from": "swans", "to": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "happy-together",
      "title": "Happy and Proud",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "accompanys", "who": "swans", "whom": "duckling"},
          {"kind": "establish-relationship", "from": "duckling", "to": "swans"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "ugly-duckling-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["lonely-winter", "spring-welcome", "happy-together"],
    "relationships": [
      {"from": "duckling", "to": "ducks"},
      {"from": "duckling", "to": "swans"},
      {"from": "swans", "to": "duckling"}
    ]
  }
}