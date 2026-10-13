{
  "characters": [
    {
      "name": "jack",
      "called": "Jack",
      "pronoun": "he",
      "physical": ["shabby"],
      "personality": ["good", "determined", "strong"],
      "movement": ["graceful"]
    },
    {
      "name": "giant",
      "called": "the giant",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["mean"],
      "movement": []
    },
    {
      "name": "mother",
      "called": "Jack's mother",
      "pronoun": "she",
      "physical": ["shabby"],
      "personality": ["good", "kind"],
      "movement": []
    }
  ],
  "main": "jack",
  "relationships": [
    {
      "from": "giant",
      "to": "jack",
      "how": ["hates"]
    },
    {
      "from": "jack",
      "to": "mother",
      "how": ["loves"]
    },
    {
      "from": "mother",
      "to": "jack",
      "how": ["loves", "is-protective-to"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Jack and the Giant",
      "mood": "anticipatory",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {
            "kind": "establish-personality",
            "who": "jack"
          }
        ],
        [
          {
            "kind": "establish-personality",
            "who": "giant"
          },
          {
            "kind": "establish-relationship",
            "from": "giant",
            "to": "jack"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "jack",
            "feelings": [
              {
                "feeling": "pride",
                "sign": "positive",
                "amount": "medium"
              }
            ]
          }
        ]
      ]
    },
    {
      "name": "escape",
      "title": "Jack Gets Away",
      "mood": "hopeful",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {
            "kind": "chases",
            "who": "giant",
            "whom": "jack"
          }
        ],
        [
          {
            "kind": "meets",
            "who": "jack",
            "whom": "mother"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "giant",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "negative",
                "amount": "high"
              },
              {
                "feeling": "pride",
                "sign": "negative",
                "amount": "high"
              }
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "jack",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "medium"
              },
              {
                "feeling": "pride",
                "sign": "positive",
                "amount": "high"
              }
            ]
          }
        ]
      ]
    },
    {
      "name": "happy-together",
      "title": "Jack and His Mother",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "establish-personality",
            "who": "mother"
          }
        ],
        [
          {
            "kind": "accompanys",
            "who": "mother",
            "whom": "jack"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "jack",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "high"
              }
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mother",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "high"
              }
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "jack-and-the-giant-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "low",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["escape", "happy-together"],
    "relationships": [
      {
        "from": "jack",
        "to": "mother"
      },
      {
        "from": "giant",
        "to": "jack"
      }
    ]
  }
}