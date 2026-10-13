{
  "characters": [
    {
      "name": "gretel",
      "called": "Gretel",
      "pronoun": "she",
      "physical": ["physically-weak"],
      "personality": ["kind", "good", "strong", "determined"],
      "movement": []
    },
    {
      "name": "hansel",
      "called": "Hansel",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["kind", "good", "friendly"],
      "movement": []
    },
    {
      "name": "step-mother",
      "called": "the stepmother",
      "pronoun": "she",
      "physical": ["powerful"],
      "personality": ["mean", "selfish"],
      "movement": []
    },
    {
      "name": "witch",
      "called": "the witch",
      "pronoun": "she",
      "physical": ["magical", "powerful"],
      "personality": ["evil", "mean"],
      "movement": []
    }
  ],
  "main": "gretel",
  "relationships": [
    {"from": "gretel", "to": "hansel", "how": ["loves", "is-protective-to"]},
    {"from": "hansel", "to": "gretel", "how": ["loves"]},
    {"from": "step-mother", "to": "gretel", "how": ["hates", "dominates"]},
    {"from": "step-mother", "to": "hansel", "how": ["dominates"]},
    {"from": "witch", "to": "hansel", "how": ["hates", "dominates"]},
    {"from": "witch", "to": "gretel", "how": ["dominates"]}
  ],
  "scenes": [
    {
      "name": "loving-siblings",
      "title": "A Kind Brother and Sister",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "gretel"},
          {"kind": "establish-personality", "who": "hansel"}
        ],
        [
          {"kind": "establish-relationship", "from": "gretel", "to": "hansel"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gretel",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]
          }
        ]
      ]
    },
    {
      "name": "sent-away",
      "title": "Sent Away Together",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "step-mother"}
        ],
        [
          {"kind": "accompanys", "who": "gretel", "whom": "hansel"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gretel",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "medium"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "hansel",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "medium"}]
          }
        ]
      ]
    },
    {
      "name": "kept-apart",
      "title": "The Witch Keeps Them Apart",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "witch"}
        ],
        [
          {"kind": "prevents", "who": "witch", "meets": ["gretel", "hansel"]}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gretel",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "hansel",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "gretel-rescues-hansel",
      "title": "Gretel Pushes the Witch Away",
      "mood": "hopeful",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "pushes", "who": "gretel", "whom": "witch"}
        ],
        [
          {
            "kind": "undoes",
            "who": "gretel",
            "scene": "kept-apart",
            "undone": {"kind": "prevents", "who": "witch", "meets": ["gretel", "hansel"]}
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "witch",
            "feelings": [{"feeling": "pride", "sign": "negative", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "gretel",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "home-together",
      "title": "Home Together",
      "mood": "(very joyous)",
      "rhythm": "fast",
      "length": "medium",
      "steps": [
        [
          {"kind": "accompanys", "who": "hansel", "whom": "gretel"}
        ],
        [
          {"kind": "establish-relationship", "from": "hansel", "to": "gretel"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gretel",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "hansel",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "hansel-and-gretel-film",
    "variety": "medium",
    "complexity": "medium",
    "originality": "medium",
    "rhythm": "high",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["kept-apart", "gretel-rescues-hansel", "home-together"],
    "relationships": [
      {"from": "gretel", "to": "hansel"},
      {"from": "hansel", "to": "gretel"},
      {"from": "witch", "to": "hansel"}
    ]
  }
}