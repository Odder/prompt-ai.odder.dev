class Prompt {
    name = 'test'
    description = 'not implemented yet'
    generate(req) {
        return `Hello world!`
    }
}

class Emoji extends Prompt {
    name = 'Emoji summariser'
    description = 'Creates an emoji summary for you'
    generate(req) {
        return `System: Predict up to 5 emojis as a response to a comment. Output emojis.
        User: This is amazing!
        Assistant: ❤️➕
        User: LGTM
        Assistant: 👍🚢
        User: ${req}
        Assistant: `
    }
}

class EmojiStories extends Prompt {
    name = 'Emoji Stories'
    description = 'Creates an emoji summary for you'
    generate(req) {
        return `System: Summarise movies, stories, series, messages only using emojis
        User: The titanic movie
        Assistant: 🚢❤️👩‍❤️‍👨🎻🧊🌊💔⚓💍👗⛴️
        User: ${req}
        Assistant: `
    }
}

class TranslateFrench extends Prompt {
    name = 'French translator'
    description = 'translates a text to french'
    generate(req) {
        return `System: Translate texts to French.
        User: hi!
        Assistant: Bonjour !
        User: ${req}
        Assistant: `
    }
}

class PythonFunction extends Prompt {
    name = 'Python function'
    description = 'writes code for you'
    generate(req) {
        return `System: Write python code. Should be concise and without code comments.
        User: fibonacci sequence
        Assistant: \`\`\`python
def fibonacci(n):
    if n == 1 or n == 0:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
        User: Calculate midpoint between 3 points
        Assistant: \`\`\`python
def calculate_midpoint(x1, y1, x2, y2, x3, y3):
   mid_x = (x1 + x2 + x3) / 3
   mid_y = (y1 + y2 + y3) / 3
   return mid_x, mid_y
\`\`\`
        User: ${req}
        Assistant: `
    }
}

class Naked extends Prompt {
    name = 'Vanilla'
    description = 'no prompt'
    generate(req) {
        return req
    }
}

class PromptExecutor {
    session = null
    printer = null
    constructor(session, printer) {
        this.session = session
        this.printer = printer
    }
    async handle(req) {
        const resp = await this.session.prompt(req)
        this.printer.print(resp)
        return resp
    }
    async handleWithTiming(req) {
        const startTime = performance.now()
        await this.handle(req)
        const endTime = performance.now()
        const timeTaken = endTime - startTime
        document.getElementById('timeTaken').innerText = `Results generated in ${timeTaken}ms`
    }
}

class StreamExecutor extends PromptExecutor {
    async handle(req) {
        let resp = ''
        const stream = await this.session.promptStreaming(req)
        for await (const response of stream) {
            this.printer.print(response)
            resp = await response
        }
        return resp
    }
}

class SimplePrinter {
    outputDiv = null
    constructor(outputDiv) {
        this.outputDiv = outputDiv ?? document.getElementById('output');
    }
    async print(txt) {
        this.outputDiv.innerHTML = await marked.parse(txt);
    }
}

const prompts = {
    emojis: new Emoji(),
    emojiStory: new EmojiStories(),
    translateFrench: new TranslateFrench(),
    pythonFunction: new PythonFunction(),
    naked: new Naked(),
}
const executors = {
    prompt: PromptExecutor,
    stream: StreamExecutor,
}
const printers = {
    simple: new SimplePrinter()
}



document.addEventListener('DOMContentLoaded', async (event) => {
    const inputField = document.getElementById('userInput')

    const printerSelect = document.getElementById('printerSelect')
    const executorSelect = document.getElementById('executorSelect')
    const prompterSelect = document.getElementById('prompterSelect')

    let session = null

    try {
        if (await ai.canCreateTextSession() != 'no') {
            session = await ai.createTextSession();
        }
        else {
            console.info('could not create session')
            return
        }
    }
    catch {
        document.getElementById('mainContent').innerHTML = `<section class="mb-4">
                <h2 class="text-2xl font-semibold">Your browser does not support the prompt AI API yet</h2>
            </section>`
        return
    }
    let printer = null
    let prompt = null
    let executor = null

    const setExecutor = () => {
        printer = printers[printerSelect.value]
        prompt = prompts[prompterSelect.value]
        executor = new executors[executorSelect.value](session, printer)
        console.log(`Updated executor`, printer, prompt, executor)
    }

    setExecutor()

    const handleInput = async () => {
        console.log('handling input')
        const userInput = inputField.value;
        if (userInput.length > 0) {
            executor.handleWithTiming(prompt.generate(userInput))
        }
    };

    // submitButton.addEventListener('click', async () => {
    //     handleInput()
    // });
    inputField.addEventListener('change', async () => {
        handleInput()
    })

    printerSelect.addEventListener('change', async () => {
        setExecutor()
    })
    prompterSelect.addEventListener('change', async () => {
        setExecutor()
    })
    executorSelect.addEventListener('change', async () => {
        setExecutor()
    })
});
