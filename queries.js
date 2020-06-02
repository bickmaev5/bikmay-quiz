const isRegistered = `
    query GetUser($user_id: bigint) {
        telegram_users(where: {user_id: {_eq: $user_id}}) {
            id
            first_name
            last_name
            phone_number
            user_id
            question_id
        }
    }
`;

const registerUser = `
    mutation insert_single_telegram_uesrs($object: telegram_users_insert_input!) {
        insert_telegram_users_one(object: $object){
            first_name
            last_name
            phone_number
            user_id
        }
    }
`;

const getQuestion = `
query MyQuery($id: uuid!) {
    quiz_questions_by_pk(id: $id) {
      id
      text
      answers {
        answer
        id
        isCorrect
      }
    }
  }  
`;

const getQuestions = `
    query getQuestions {
        quiz_questions {
            id,
            text,
        }
    }
`;



const setQuestuion = `
    mutation setQuestion($userId: uuid!, $question_id: uuid) {
        update_telegram_users_by_pk(pk_columns: {id: $userId}, _set: { question_id: $question_id}) {
            question_id,
        }
    }
`;


const setAnswer = `
mutation MyMutation($object: quiz_results_insert_input!) {
    insert_quiz_results_one(object: $object) {
      correct
      quiz_answer_id
      user_id
    }
  }  
`;


const getResults = `
  query getResults($id: bigint) {
    quiz_results(where: {user_id: {_eq: $id}}) {
        correct
    }
  }
`

module.exports = {
    isRegistered,
    registerUser,
    getQuestion,
    getQuestions,
    setQuestuion,
    setAnswer,
    getResults,
}
