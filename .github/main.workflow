workflow "Pull Request" {
  on = "pull_request"
  resolves = ["Pull Request: npm run lint", "Pull Request: npm test"]
}

action "Pull Request: opened or updated" {
  uses = "actions/bin/filter@0dbb077f64d0ec1068a644d25c71b1db66148a24"
  args = "action 'opened|synchronize'"
}

action "Pull Request: npm install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Pull Request: opened or updated"]
  args = "ci"
}

action "Pull Request: npm run lint" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Pull Request: npm install"]
  args = "run lint"
}

action "Pull Request: npm test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Pull Request: npm install"]
  args = "test"
}
