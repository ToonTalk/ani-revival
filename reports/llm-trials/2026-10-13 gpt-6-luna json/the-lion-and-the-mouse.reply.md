{
  "characters": [
    {
      "name": "lion",
      "called": "the lion",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["strong", "stubborn"],
      "movement": []
    },
    {
      "name": "mouse",
      "called": "the mouse",
      "pronoun": "she",
      "physical": ["physically-weak"],
      "personality": ["shy", "determined", "strong"],
      "movement": []
    }
  ],
  "main": "mouse",
  "relationships": [
    {"from": "lion", "to": "mouse", "how": ["dominates"]},
    {"from": "mouse", "to": "lion", "how": ["is-obedient-to"]}
  ],
  "scenes": [
    {
      "name": "the-capture",
      "title": "The Capture",
      "mood": "normal",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [{"kind": "establish-personality", "who": "mouse"}],
        [{"kind": "establish-personality", "who": "lion"}],
        [{"kind": "establish-relationship", "from": "lion", "to": "mouse"}],
        [{"kind": "chases", "who": "lion", "whom": "mouse"}]
      ]
    },
    {
      "name": "the-rescue",
      "title": "The Rescue",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {
            "kind": "undoes",
            "who": "lion",
            "scene": "the-capture",
            "undone": {"kind": "chases", "who": "lion", "whom": "mouse"}
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ],
        [{"kind": "pushes", "who": "mouse", "whom": "lion"}]
      ]
    },
    {
      "name": "friends",
      "title": "Friends",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "change-relationship",
            "who": "lion",
            "whom": "mouse",
            "from": ["dominates"],
            "to": ["is-tolerant-of"],
            "causedBy": "mouse"
          }
        ],
        [
          {
            "kind": "change-relationship",
            "who": "mouse",
            "whom": "lion",
            "from": ["is-obedient-to"],
            "to": ["is-tolerant-of"],
            "causedBy": "lion"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "lion-and-mouse-film",
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
    "scenes": ["the-rescue", "friends"],
    "relationships": [
      {"from": "mouse", "to": "lion"},
      {"from": "lion", "to": "mouse"}
    ]
  }
}