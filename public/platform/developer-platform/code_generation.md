---
id: code_generation
title: Coding
sidebar_position: 6
---

# Coding

LLMs are powerfull tools for text generation, and they also show great performance in code generation for multiple tasks, both for code completion, code generation and agentic tool use for semi-automated software development.

We provide 2 major families of llms for coding:
- **Codestral**: Specifically trained for Code Generation and FIM.
- **Devstral**: Specifically trained for Agentic Tool Use for Software Development.

Note that we also provide **Codestral Embed**, for semantic search and embedding code databases, repositories, and powering coding assistants with state-of-the-art retrieval. Learn more about it [here](https://docs.mistral.ai/capabilities/embeddings/code_embeddings).

<SectionTab as="h1" sectionId="before-you-start">Before You Start</SectionTab>

### Endpoints & Models

We provide 2 main endpoints:
- Fill-In-The-Middle : `https://api.mistral.ai/v1/fim/completions`
  - for code completion and code generation; supporting `codestral-latest`.
- Instruction Following: `https://api.mistral.ai/v1/chat/completions`
  - for coding and agentic tool use; supporting `codestral-latest`, `devstral-small-latest` and `devstral-medium-latest`.

<SectionTab as="h1" sectionId="fim-and-if">FIM and IF</SectionTab>

### Use Coding specialized Models

Below you can find how to use our coding dedicated models, from **code completion** to **instruction following and agentic** models.

<ExplorerTabs id="endpoints_and_models">
  <ExplorerTab value="fim" label="FIM">
    With this feature, users can define the starting point of the code using a `prompt`, and the ending point of the code using an optional `suffix` and an optional `stop`. The FIM model will then generate the code that fits in between, making it ideal for tasks that require a specific piece of code to be generated.

:::tip[ ]
We also provide the `min_tokens` and `max_tokens` sampling parameters, which are particularly useful for code generation as it allows you to set the minimum and maximum number of tokens that should be produced. This is especially useful when FIM models decide to produce no tokens at all, or are overly verbose, allowing developers to enforce completions within a specific range if they are needed.
:::

<SectionTab as="h2" variant="secondary" sectionId="codestral">Codestral</SectionTab>

Codestral is a cutting-edge generative model that has been specifically designed and optimized for code generation tasks, including fill-in-the-middle and code completion. Codestral was trained on 80+ programming languages, enabling it to perform well on both common and less common languages. 

:::important[ ]
We currently offer two domains for Codestral endpoints, both providing FIM and instruct routes:

| Domain  | Features |
| ------------- | ------------- |
| codestral.mistral.ai | - Monthly subscription based, currently free to use <br/> - Requires a new key for which a phone number is needed |
| api.mistral.ai  | - Allows you to use your existing API key and you can pay to use Codestral <br/> - Ideal for business use |

Wondering which endpoint to use?
- If you're a user, wanting to query Codestral as part of an IDE plugin, codestral.mistral.ai is recommended.
- If you're building a plugin, or anything that exposes these endpoints directly to the user, and expect them to bring their own API keys, you should also target codestral.mistral.ai
- For all other use cases, api.mistral.ai will be better suited

*This guide uses api.mistral.ai for demonstration.*
:::

Below we present three approaches to using Codestral for code generation.

<ExplorerTabs id="codestral">
    <ExplorerTab value="fill-in-the-middle" label="Fill In The Middle">
        Originally, these models are designed to **complete code in-between 2 points**: a prefix (here called `prompt`) and a `suffix`, generating the code in-between.

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

model = "codestral-latest"
prompt = "def fibonacci(n: int):"
suffix = "n = int(input('Enter a number: '))\nprint(fibonacci(n))"

response = client.fim.complete(
    model=model,
    prompt=prompt,
    suffix=suffix,
    temperature=0,
    # min_tokens=1, # Uncomment to enforce completions to at least 1 token
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

async function main() {
    const response = await client.fim.complete({
        model: "codestral-latest",
        prompt: "def fibonacci(n: int):",
        suffix: "n = int(input('Enter a number: '))\nprint(fibonacci(n))",
        temperature: 0,
        // minTokens: 1, // Uncomment to enforce completions to at least 1 token
    });
}

main();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/fim/completions' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header "Authorization: Bearer $MISTRAL_API_KEY" \
--data '{
    "model": "codestral-latest",
    "prompt": "def fibonacci(n: int):",
    "suffix": "n = int(input('Enter a number: '))\nprint(fibonacci(n))",
    "max_tokens": 64,
    "temperature": 0
}'
``` 

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "43a6d46ff02a42c8b7146d94c5140a1e",
  "created": 1757437831,
  "model": "codestral-latest",
  "usage": {
    "prompt_tokens": 28,
    "total_tokens": 72,
    "completion_tokens": 44
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n\n"
      }
    }
  ]
}
```

  </TabItem>
</Tabs>

The `prefix` + `completion` + `suffix` will correspond to the full code.

```py
# prefix
def fibonacci(n: int):
  # completion
  if n == 0:
    return 0
  elif n == 1:
    return 1
  else:
    return fibonacci(n-1) + fibonacci(n-2)
# suffix
n = int(input('Enter a number: '))
print(fibonacci(n))
```
    </ExplorerTab>
    <ExplorerTab value="completion" label="Completion">
        You can use the model for **pure code completion**, by only providing a `prompt` and no `suffix`.

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

model = "codestral-latest"
prompt = "def is_odd(n):\n    return n % 2 == 1\ndef test_is_odd():"

response = client.fim.complete(model=model, prompt=prompt, temperature=0)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

async function main() {
    const response = await client.fim.complete({
        model: "codestral-latest",
        prompt: "def is_odd(n):\n    return n % 2 == 1\ndef test_is_odd():",
        temperature: 0,
        // minTokens: 1, // Uncomment to enforce completions to at least 1 token
    });
}

main();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/fim/completions' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header "Authorization: Bearer $MISTRAL_API_KEY" \
--data '{
    "model": "codestral-latest",
    "prompt": "def is_odd(n):\n    return n % 2 == 1\ndef test_is_odd():", 
    "suffix": "",
    "max_tokens": 64,
    "temperature": 0
}'
``` 

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "be8c5eba61c148bf81652f7e9378e773",
  "created": 1757439088,
  "model": "codestral-latest",
  "usage": {
    "prompt_tokens": 26,
    "total_tokens": 91,
    "completion_tokens": 65
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "\n    assert is_odd(3) == True\n    assert is_odd(4) == False\n    assert is_odd(0) == False\n    assert is_odd(-1) == True\n    assert is_odd(-2) == False\n    print(\"All test cases pass\")"
      }
    }
  ]
}
```
    </TabItem>
</Tabs>

The `prefix` + `completion` will correspond to the full code.

```python
# prefix
def is_odd(n): 
  return n % 2 == 1 
def test_is_odd():
  # completion
  assert is_odd(3) == True
  assert is_odd(4) == False
  assert is_odd(0) == False
  assert is_odd(-1) == True
  assert is_odd(-2) == False
  print("All test cases pass")
```
    </ExplorerTab>
    <ExplorerTab value="stop-tokens" label="Stop Tokens">
        You can use stop tokens to control and **stop generation** of the model when it generates specific strings.

:::tip[ ]
We recommend adding stop tokens for IDE autocomplete integrations to prevent the model from being too verbose.
:::

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

model = "codestral-latest"
prompt = "def fibonacci(n: int):"
suffix = "n = int(input('Enter a number: '))\nprint(fibonacci(n))"

response = client.fim.complete(
    model=model, prompt=prompt, suffix=suffix, temperature=0, stop=["return"]
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

async function main() {
    const response = await client.fim.complete({
        model: "codestral-latest",
        prompt: "def fibonacci(n: int):",
        suffix: "n = int(input('Enter a number: '))\nprint(fibonacci(n))",
        temperature: 0,
        stop: ["return"],
        // minTokens: 1, // Uncomment to enforce completions to at least 1 token
    });
}

main();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/fim/completions' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header "Authorization: Bearer $MISTRAL_API_KEY" \
--data '{
    "model": "codestral-latest",
    "prompt": "def fibonacci(n: int):", 
    "suffix": "n = int(input('Enter a number: '))\nprint(fibonacci(n))",
    "stop": ["return"],
    "max_tokens": 64,
    "temperature": 0
}'
``` 

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "3fe250c15cd743159cb47dadd472e04f",
  "created": 1757438823,
  "model": "codestral-latest",
  "usage": {
    "prompt_tokens": 28,
    "total_tokens": 38,
    "completion_tokens": 10
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "\n    if n == 0:\n        "
      }
    }
  ]
}
```

  </TabItem>
</Tabs>

The `prefix` + `completion` + `suffix` would correspond to the full code normally, but in this case it stoped generating when it reached the `return` keyword.

```py
# prefix
def fibonacci(n: int):
  # completion
  if n == 0:
    # stopped here
# suffix
n = int(input('Enter a number: '))
print(fibonacci(n))
```
    </ExplorerTab>
</ExplorerTabs>
  </ExplorerTab>
  <ExplorerTab value="instruct-following" label="Instruction Following">
    We also provide the instruct chat endpoint of Codestral with the same model `codestral-latest`.  
The only difference is the endpoint used; so you can leverage powerfull code completion with instruct and chat use cases.

However we also provide `devstral-small-latest` and `devstral-medium-latest` for agentic tool use for software development, this family of models is specifically trained to navigate code bases and leverage tool usage for diverse tasks.

:::tip
Before continuing, we recommend reading the [Chat Competions](completion) documentation to learn more about the chat completions API and how to use it before proceeding.
:::

<SectionTab as="h2" variant="secondary" sectionId="instruct-codestral">Codestral</SectionTab>

Here is an example of how to use the instruct endpoint of Codestral, it's perfect for specific **code generation** of specific snippets or **code completion** while **following instructions**; so you can better guide generation and exchange with a powerfull coding model.

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

model = "codestral-latest"
message = [{"role": "user", "content": "Write a function for fibonacci"}]
chat_response = client.chat.complete(
    model = model,
    messages = message
)
```

    </TabItem>
    <TabItem value="typescript" label="typescript">

```typescript

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

async function main() {
    const response = await client.chat.complete({
        model: "codestral-latest",
        messages: [{role: "user", content: "Write a function for fibonacci"}]
    });
}

main();
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl --location "https://api.mistral.ai/v1/chat/completions" \
     --header 'Content-Type: application/json' \
     --header 'Accept: application/json' \
     --header "Authorization: Bearer $MISTRAL_API_KEY" \
     --data '{
    "model": "codestral-latest",
    "messages": [{"role": "user", "content": "Write a function for fibonacci"}]
  }'
``` 
    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "id": "93803125293c475f867b09e337433a0b",
  "created": 1757439506,
  "model": "codestral-latest",
  "usage": {
    "prompt_tokens": 9,
    "total_tokens": 441,
    "completion_tokens": 432
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "# Fibonacci Function\n\nHere's a Python function to calculate the nth Fibonacci number:\n\n```python\ndef fibonacci(n):\n    \"\"\"\n    Calculate the nth Fibonacci number.\n\n    Args:\n        n (int): The position in the Fibonacci sequence (0-based index)\n\n    Returns:\n        int: The nth Fibonacci number\n\n    Raises:\n        ValueError: If n is negative\n    \"\"\"\n    if n < 0:\n        raise ValueError(\"Input must be a non-negative integer\")\n\n    # Base cases\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n\n    # Initialize variables for iterative approach\n    a, b = 0, 1\n\n    # Iterate from 2 to n\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n\n    return b\n```\n\n## Alternative Implementations\n\n### Recursive Approach (less efficient for large n)\n```python\ndef fibonacci_recursive(n):\n    if n < 0:\n        raise ValueError(\"Input must be a non-negative integer\")\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)\n```\n\n### Using Memoization (optimized recursive approach)\n```python\ndef fibonacci_memo(n, memo={}):\n    if n < 0:\n        raise ValueError(\"Input must be a non-negative integer\")\n    if n in memo:\n        return memo[n]\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)\n    return memo[n]\n```\n\nThe iterative approach is generally preferred for performance reasons, especially for larger values of n, as it runs in O(n) time with O(1) space complexity."
      }
    }
  ]
}
```

  </TabItem>
</Tabs>

<SectionTab as="h2" variant="secondary" sectionId="devstral">Devstral</SectionTab>

While Codestral is designed for code generation and FIM, Devstral is a cutting-edge generative model that has been specifically designed and optimized for **agentic tool use for software development**, it can leverage function calling to navigate code bases and call the right tools to perform specific tasks for semi-automated software development.

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

model = "devstral-medium-latest"
message = [{"role": "user", "content": "Create a new file called test.py and write a function for fibonacci"}]

tools = [
    {
        "type": "function",
        "function": {
            "name": "create_file",
            "description": "Create a new file with the given name and content",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "The name of the file to create",
                    },
                    "content": {
                        "type": "string",
                        "description": "The content to write to the file",
                    },
                },
                "required": ["filename", "content"],
            },
        },
    }
]

chat_response = client.chat.complete(
    model = model,
    messages = message,
    tools = tools
)
```

    </TabItem>
    <TabItem value="typescript" label="typescript">

```typescript

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

async function main() {
    const response = await client.chat.complete({
        model: "devstral-medium-latest",
        messages: [{role: "user", content: "Create a new file called test.py and write a function for fibonacci"}],
        tools: [
            {
                "type": "function",
                "function": {
                    "name": "create_file",
                    "description": "Create a new file with the given name and content",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "filename": {
                                "type": "string",
                                "description": "The name of the file to create"
                            },
                            "content": {
                                "type": "string",
                                "description": "The content to write to the file"
                            }
                        },
                        "required": ["filename", "content"]
                    }
                }
            }
        ]
    });
}
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl --location "https://api.mistral.ai/v1/chat/completions" \
     --header 'Content-Type: application/json' \
     --header 'Accept: application/json' \
     --header "Authorization: Bearer $MISTRAL_API_KEY" \
     --data '{
    "model": "devstral-medium-latest",
    "messages": [{"role": "user", "content": "Create a new file called test.py and write a function for fibonacci"}],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "create_file",
                "description": "Create a new file with the given name and content",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filename": {
                            "type": "string",
                            "description": "The name of the file to create"
                        },
                        "content": {
                            "type": "string",
                            "description": "The content to write to the file"
                        }
                    },
                    "required": ["filename", "content"]
                }
            }
        }
    ]
  }'
``` 
    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "id": "519df29e0aad49318796114e3926b1d3",
  "created": 1757439690,
  "model": "devstral-medium-latest",
  "usage": {
    "prompt_tokens": 117,
    "total_tokens": 329,
    "completion_tokens": 212
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "tool_calls",
      "message": {
        "role": "assistant",
        "tool_calls": [
          {
            "id": "OC1g0C1a1",
            "function": {
              "name": "create_file",
              "arguments": "{\"filename\": \"test.py\", \"content\": \"def fibonacci(n):\\n    \\\"\\\"\\\"\\n    Calculate the nth Fibonacci number.\\n\\n    :param n: The position in the Fibonacci sequence.\\n    :return: The nth Fibonacci number.\\n    \\\"\\\"\\\"\\n    if n <= 0:\\n        return \\\"Input should be a positive integer.\\\"\\n    elif n == 1:\\n        return 0\\n    elif n == 2:\\n        return 1\\n    else:\\n        a, b = 0, 1\\n        for _ in range(2, n):\\n            a, b = b, a + b\\n        return b\\n\\n# Example usage\\nif __name__ == \\\"__main__\\\":\\n    n = 10  # Change this value to test other cases\\n    print(f\\\"The {n}th Fibonacci number is: {fibonacci(n)}\\\")\"}"
            },
            "index": 0
          }
        ],
        "content": ""
      }
    }
  ]
}
```

     </TabItem>
</Tabs>
  </ExplorerTab>
</ExplorerTabs>

<SectionTab as="h1" sectionId="integrations">Integrations</SectionTab>

### Integrations using our Models

If you are interested on leveraging our models in your favorite IDE, you can find below a list of integrations.

<SectionTab as="h2" variant="secondary" sectionId="mistral-vibe">Mistral Vibe</SectionTab>

Mistral Vibe is a command-line coding assistant powered by Mistral's models. It provides a conversational interface to your codebase, allowing you to use natural language to explore, modify, and interact with your projects through a powerful set of tools.

You can find more information about it [here](https://docs.mistral.ai/mistral_vibe/introduction) or access the github repository [here](https://github.com/mistralai/mistral-vibe).

<SectionTab as="h2" variant="secondary" sectionId="more">More</SectionTab>

<ExplorerTabs id="integrations">
  <ExplorerTab value="codestral-integrations" label="Codestral Integrations">
    <details>
<summary><b>Integration with continue.dev</b></summary>

Continue.dev supports both Codestral base for code generation and Codestral Instruct for chat. 

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/mjltGOJMJZA?si=Tmf0kpPn3hVJ0CaM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

#### How to set up Codestral with Continue

**Here is a step-by-step guide on how to set up Codestral with Continue using the Mistral AI API:**

1. Install the Continue VS Code or JetBrains extension following the instructions [here](https://docs.continue.dev/quickstart). 
Please make sure you install Continue version >v0.8.33.

2. Automatic set up:

- Click on the Continue extension iron on the left menu. Select `Mistral API` as a provider, select `Codestral` as a model. 
- Click "Get API Key" to get Codestral API key. 
- Click "Add model", which will automatically populate the config.json. 

<img src="/img/guides/codestral1.png" alt="drawing" width="300"/>

2. (alternative) Manually edit config.json 
- Click on the gear icon in the bottom right corner of the Continue window to open `~/.continue/config.json` (MacOS) /  `%userprofile%\.continue\config.json` (Windows)
- Log in and request a Codestral API key on Mistral AI's La Plateforme [here](https://console.mistral.ai/codestral)
- To use Codestral as your model for both `autocomplete` and `chat`, replace  `[API_KEY]` with your Mistral API key below and add it to your `config.json` file:

```json title="~/.continue/config.json"
{
  "models": [
    {
      "title": "Codestral",
      "provider": "mistral",
      "model": "codestral-latest",
      "apiKey": "[API_KEY]"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "[API_KEY]"
  }
}
```

If you run into any issues or have any questions, please join our Discord and post in `#help` channel [here](https://discord.gg/EfJEfdFnDQ)
</details>

<details>
<summary><b>Integration with Tabnine</b></summary>

Tabnine supports Codestral Instruct for chat. 

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/pFa4NLK9Lbw?si=7tsfFUsOyllkwl-M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

#### How to set up Codestral with Tabnine

##### What is Tabnine Chat? 
Tabnine Chat is a code-centric chat application that runs in the IDE and allows developers
 to interact with Tabnine’s AI models in a flexible, free-form way, using natural language. 
Tabnine Chat also supports dedicated quick actions that use predefined prompts optimized
 for specific use cases.

##### Getting started
To start using Tabnine Chat, first [launch](https://docs.tabnine.com/main/getting-started/getting-the-most-from-tabnine-chat/launch) it in your IDE (VSCode, JetBrains, or Eclipse). 
Then, learn how to [interact](https://docs.tabnine.com/main/getting-started/getting-the-most-from-tabnine-chat/interact) with Tabnine Chat, for example, how to ask questions or give 
instructions. Once you receive your response, you can [read, review, and apply](https://docs.tabnine.com/main/getting-started/getting-the-most-from-tabnine-chat/consume) it within 
your code.

##### Selecting Codestral as Tabnine Chat App model

In the Tabnine Chat App, use the [model selector](https://docs.tabnine.com/main/getting-started/getting-the-most-from-tabnine-chat/switching-between-chat-ai-models) to choose *Codestral*.

</details>

<details>
<summary><b>Integration with LangChain</b></summary>

LangChain provides support for Codestral Instruct. Here is how you can use it in LangChain: 

```py
# make sure to install `langchain` and `langchain-mistralai` in your Python environment

import os
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate 

api_key = os.environ["MISTRAL_API_KEY"]
mistral_model = "codestral-latest"
llm = ChatMistralAI(model=mistral_model, temperature=0, api_key=api_key)
llm.invoke([("user", "Write a function for fibonacci")])
```

For a more complex use case of self-corrective code generation using the instruct Codestral tool use, check out this [notebook](https://github.com/mistralai/cookbook/blob/main/third_party/langchain/langgraph_code_assistant_mistral.ipynb) and this video:

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/zXFxmI9f06M?si=8ZEoqNVECVJQFcVA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</details>

<details>
<summary><b>Integration with LlamaIndex</b></summary>

LlamaIndex provides support for Codestral Instruct and Fill In Middle (FIM) endpoints. Here is how you can use it in LlamaIndex: 

```py
# make sure to install `llama-index` and `llama-index-llms-mistralai` in your Python enviornment

import os
from llama_index.core.llms import ChatMessage
from llama_index.llms.mistralai import MistralAI

api_key =  os.environ["MISTRAL_API_KEY"]
mistral_model = "codestral-latest"
messages = [
    ChatMessage(role="user", content="Write a function for fibonacci"),
]
MistralAI(api_key=api_key, model=mistral_model).chat(messages)
```
Check out more details on using Instruct and Fill In Middle(FIM) with LlamaIndex in this [notebook](https://github.com/run-llama/llama_index/blob/main/docs/docs/examples/cookbooks/codestral.ipynb).

</details>

<details>
<summary><b>Integration with Jupyter AI</b></summary>

Jupyter AI seamlessly integrates Codestral into JupyterLab, offering users a streamlined and enhanced AI-assisted coding experience within the Jupyter ecosystem. This integration boosts productivity and optimizes users' overall interaction with Jupyter. 

To get started using Codestral and Jupyter AI in JupyterLab, first install needed packages in your Python environment:
```bash
pip install jupyterlab langchain-mistralai jupyter-ai pandas matplotlib
```

Then launch Jupyter Lab: 
```bash
jupyter lab
```

Afterwards, you can select Codestral as your model of choice, input your Mistral API key, and start coding with Codestral!

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/jNUSTZwlq9M?si=plx_V19ZakgrniHy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</details>

<details>
<summary><b>Integration with JupyterLite</b></summary>

JupyterLite is a project that aims to bring the JupyterLab environment to the web browser, allowing users to run Jupyter directly in their browser without the need for a local installation.

You can try Codestral with JupyterLite in your browser:
[![lite-badge](https://jupyterlite.rtfd.io/en/latest/_static/badge.svg)](https://jupyterlite.github.io/ai/lab/index.html)

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/edKyZSWy-Fw?si=pBzFV40vckyuCl6w" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</details>

<details>
<summary><b>Integration with Tabby</b></summary>

Tabby is an open-source AI coding assistant. You can use Codestral for both code completion and chat via Tabby. 

To use Codestral in Tabby, configure your model configuration in `~/.tabby/config.toml` as follows.

```bash
[model.completion.http]
kind = "mistral/completion"
api_endpoint = "https://api.mistral.ai"
api_key = "secret-api-key"
```

You can check out [Tabby's documentation](https://tabby.tabbyml.com/docs/administration/model/#mistral--codestral) to learn more.  

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/ufHbMyC0oGA?si=kKlH8L3EtECMdtV7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</details>

<details>
<summary><b>Integration with E2B</b></summary>

E2B provides open-source secure sandboxes for AI-generated code execution. 
With E2B, it is easy for developers to add code interpreting capabilities to AI apps using Codestral.

In the following examples, the AI agent performs a data analysis task on an uploaded CSV file, executes the AI-generated code by Codestral in the sandboxed environment by E2B, and returns a chart, saving it as a PNG file.

Python implementation ([cookbook](https://github.com/mistralai/cookbook/tree/main/third_party/E2B_Code_Interpreting/codestral-code-interpreter-python)): 
<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/26Wd-kC35Og?si=FgamyNZdzW--6iR7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

JS implementation ([cookbook](https://github.com/mistralai/cookbook/tree/main/third_party/E2B_Code_Interpreting/codestral-code-interpreter-js)):
<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/3M1_79U9RZE?si=YlTWN2chAxUhxHfr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</details>
  </ExplorerTab>
  <ExplorerTab value="devstral-integrations" label="Devstral Integrations">
    <details>
<summary><b>Integration with Open Hands</b></summary>

OpenHands is an open-source scaffolding tool designed for building AI agents focused on software development. It offers a comprehensive framework for creating and managing these agents that can modify code, run commands, browse the web, call APIs, and even copy code snippets from StackOverflow.

<iframe width="560" height="315" width="100%" src="https://www.youtube.com/embed/oV9tAkS2Xic?si=gERKTfB-hFsSzk7f" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

After creating a Mistral AI account, you can use the following commands to start the OpenHands Docker container:

```bash
export MISTRAL_API_KEY=<MY_KEY>

mkdir -p ~/.openhands && echo '{"language":"en","agent":"CodeActAgent","max_iterations":null,"security_analyzer":null,"confirmation_mode":false,"llm_model":"mistral/devstral-small-2507","llm_api_key":"'$MISTRAL_API_KEY'","remote_runtime_resource_factor":null,"github_token":null,"enable_default_condenser":true}' > ~/.openhands-state/settings.json

docker pull docker.all-hands.dev/all-hands-ai/runtime:0.48-nikolaik

docker run -it --rm --pull=always \
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.48-nikolaik \
    -e LOG_ALL_EVENTS=true \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/.openhands:/.openhands \
    -p 3000:3000 \
    --add-host host.docker.internal:host-gateway \
    --name openhands-app \
    docker.all-hands.dev/all-hands-ai/openhands:0.48
```

For more information visit the [OpenHands github repo](https://github.com/All-Hands-AI/OpenHands) and their [documentation](https://docs.all-hands.dev/usage/llms/local-llms).

</details>

<details>
<summary><b>Integration with Cline</b></summary>

Cline is an autonomous coding agent operating right in your IDE, capable of creating/editing files, executing commands, using the browser, and more with your permission every step of the way. 

<video width="100%" controls>
  <source src="/video/clinevideo.mov" type="video/mp4"/>
</video>

For more information visit the [Cline github repo](https://github.com/cline/cline).

</details>
  </ExplorerTab>
</ExplorerTabs>