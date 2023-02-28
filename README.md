
## Descrição

Projeto NestJs com arquitetura de eventos.

## Serverless

Utilizei o serverless framework para subir minhas lambdas. Dentro do arquivo `serverless.yml` tem toda configuração. Basicamente estou subindo três lambdas:
- main: 

Responsável pelas requisições http da aplicação.
- stepFunctions: 

Responsável pela stepfunctions.
- microserves: 

Responsável por consumir as mensagens do RabbitMQ.

Nesse projeto crio três filas sendo duas delas (`sales` e `transports`) para eventos e uma (`informations`) para request response.

## Endpoints
Criei dois endpoints para conseguir testar o fluxo completo da arquitetura de eventos. 

### GET - Busca as informações de uma venda
Localmente:  

Se conecta com o RabbitMQ, insere uma mensagem na fila `informations` e espera o retorno.

Lambda:

Se conecta com a lambda `microservices` passando os padrões da mensagem e aguarda o retorno.
### POST - Inicia o fluxo de uma venda
A lambda http (`main`) insere na fila de `sales` que starta a lambda de `microservices`, que consome o rabbitmq e insere na fila de `transports`.

## Testando o projeto localmente
``
    npm run build && sls offline
``

## Subindo no AWS
Após configurar as credenciais do AWS, basta rodar:
``
    npm run build && sls deploy
``
Três lambdas serão criadas em seu ambiente. 

## Configurando o .env
Necessário criar um arquivo .env dentro da pasta raiz, pode usar o .env-example como arquivo de exemplo.

    STAGE - dev ou prod

    RABBIT_URL - url do seu rabbitMQ. Ex: amqp://guest:guest@localhost:5672

    RABBIT_BROKER_ARN - ARN do broker do rabbitMQ

    RABBIT_BASIC_AUTH_ARN - ARN do AWS Secrets Manager com as credenciais do broker

    MICROSERVICE_LAMBDA - nome da lambda de microservices Ex: nest-serverless-framework-demo-dev-microservices

    ACCESS_KEY_AWS - access key AWS

    SECRET_ACCESS_KEY_AWS - secret access key AWS

    REGION_AWS - regiao AWS
