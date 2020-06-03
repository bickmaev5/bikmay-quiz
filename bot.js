const Telegraf = require('telegraf');
const graphQL = require('graphql-request');
const bot = new Telegraf(process.env.TG_BOT_KEY);
const API = process.env.HASURA_URL;
const session = require("telegraf/session");
const Stage = require('telegraf/stage')
const WizardScene = require("telegraf/scenes/wizard");

const queries = require('./queries');


const { getUserUUID } = require('./user');
const { getQuestion, answerQuestion, removeResults } = require('./questions');

const { request } = graphQL;

const template = ['a) ', 'b) ', 'c) ', 'd) '];
const templateReg = {
    'a) ': 0,
    'b) ': 1,
    'c) ': 2,
    'd) ': 3
};

bot.use(session());

const quiz = new WizardScene(
    'quiz',
    async (ctx) => {
        if (ctx.update && ctx.update.message) {
            const txt = ctx.update.message.text;
            if (txt) {
                const text = txt;
                if (text !== 'a)' && text !== 'b)' && text !== 'c)' && text !== 'd)') {
                    console.log('incomplete string: ', text);
                    return;
                }
                await answerQuestion(ctx.session.userId || ctx.update.message.from.id, templateReg[`${txt} `]);
            }
        }
        const question = await getQuestion(ctx.session.userId || ctx.update.message.from.id);
        if (typeof question !== 'string' && !!question) {
            const strings = question.answers.map((a, i) => `${template[i]}${a.answer}\n`).join('');
            const temp = `${question.text}\n${strings}`;
            ctx.reply(temp,
                Telegraf.Extra.markdown().markup(
                    markup => markup.resize()
                        .keyboard(question.answers.map(({ answer }, i) => markup.callbackButton(`${template[i]} `))).oneTime()
                ));
            return;
        }
        if (typeof question === 'string' && !!question) {
            ctx.session.result = question;
            ctx.wizard.steps[ctx.wizard.cursor + 1](ctx);
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        ctx.reply(`Ваш результат ${ctx.session.result}.`);
        return ctx.scene.leave();
    }
);

const stage = new Stage();
stage.register(quiz);
bot.use(stage.middleware());


bot.start(async (ctx) => {
    const uuid  = await getUserUUID(ctx.update.message.from.id);
    ctx.session.userId = ctx.update.message.from.id;
    if (!uuid) {
        return ctx.reply('Для начала тестирования, зарегистрируйтесь, нажав на кнопку ниже!',
        Telegraf.Extra.markup((markup) => markup.resize()
            .keyboard([
                markup.contactRequestButton('Зарегистрироваться!'),
            ]).oneTime()
        ))
    } else {
        return ctx.scene.enter('quiz');
    }
}); 

bot.on('contact', async (ctx) => {
    const variables = { object: ctx.update.message.contact};
    const isRegistered = await request(API, queries.isRegistered, {
        user_id: ctx.update.message.from.id,
    });
    if (!isRegistered.telegram_users.length > 0) {
        await request(API, queries.registerUser, variables);
    }
    return ctx.scene.enter('quiz');
});


bot.launch();
