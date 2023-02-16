import hashlib
import random
import string
from flask import Flask, render_template, Response, request, redirect, session, url_for, jsonify
from markupsafe import escape
import dbops
import random

#Versão utilizada do Python = 3.10.9 64 bit


#inicialização do flask
app = Flask(__name__)

#criação da secret key pra session 
app.secret_key = b'((s23e__#i54e/*!' 

#Rota padrão, caso exista uma session open e com o campo email ele retorta a pagina com o conteudo, ou seja ele loga o usuário
#Se não exister uma session open ele redireciona para o 'login'
@app.route('/')
def index():

    if 'email' in session:
        return render_template('index.html', url = "127.0.0.1:5000")

    else:
        return redirect(url_for('login'))


"""Rota de logout, se tiver uma session open ele limpa a session e retonar pra "/" que automaticamente
leva para a pagina de login, isso foi feito para garantir que o usuário não está logado """
@app.route('/logout')
def logout():

    if 'email' in session:

        session.clear()
        return redirect('/')


#Rota do login
@app.route('/login', methods = ['GET', 'POST'])
def login():

    if request.method == 'POST':
        


        #Try para tentar pegar o valor da checkbox, realizei esse Try devido ao erro que ele gera caso a checkbox não está selecionada
        try:
            #Caso o user selecione a checkbox ele retorna o valor de "on"
            checkbox = request.form['checkbox1']

            #Em seguida ele define a variável checkbox=True
            if checkbox == "on":
                checkbox = True

        #Se der erro, ou seja a checkbox não foi selecionada e não retornou valor ele devine a variável checkbox = False
        except: 
            checkbox = False

        #Query da base de dados user com filter_by, ou seja se o email inserido pelo User existir é feito a seleção do elemento na base de dados e envia para a variável "user" 
        data = [escape(request.form['email']),escape(request.form['password'])]
        status, user= dbops.login(data)
        
        if len(user) > 0:
            if status:

            #Se for igual ele cria a session de email e nome, por conta do nome poder estar repitido(sendo que pessoas podem ter o mesmo nome) e o email ser a variável unique da base de dados
            #Essa sessão é enviada para o front-ent
                session['email'] = user["email"]
                session['nome'] = user["nome"]
                session['id'] = user["id"]
                session['role'] = user["role"]

                #Caso o user tenha selecionado a checkbox a session fica permanent, ou seja, sempre que o user entrar no site a sessão permanecerá ao menos que ele clique em logout 
                if checkbox == True:
                    session.permanent = True

                #Retorna ao index com a session criada
                return redirect(url_for('index'))
            else:
                return render_template('login.html', div = "Senha inválida!")
        else:
            return render_template('login.html', div = "Esse email não está cadastrado!")




    return render_template('login.html', local_ip="127.0.0.1")

#Rota de Registo 
@app.route('/register', methods = ['GET', 'POST'])
def register():
    if request.method == 'POST':
        #Recebimento dos dados para o registo
        dados= (escape(request.form['nome']), escape(request.form['email']), escape(request.form['password']), escape(request.form['funcao']))
        #Função retorna um status (True ou False) e uma mensagem
        status, mensage = dbops.registo(dados)


        if status:
            return render_template('register.html', div = mensage)

        return render_template('login.html')
        
    return render_template('register.html')


#Rota que executa o CRUD na bases de dados
#É enviado do front-end uma operação (para realizar o match_case)
@app.route('/crud_ops', methods = ['GET', 'POST'])
def crud_ops():
    
    if request.method == "POST":
        operacao = request.form['operacao']
        match operacao:
            case "inserir_comentario":
                return dbops.inserir_comentario(request.form['account'], request.form['game'], request.form['comment'], request.form['rating'])
            case "comprar_jogo":
                return dbops.comprar_jogo(request.form['id_user'], request.form['id_jogo'])
            case "delete_comentario":
                return dbops.delete_comentario(request.form['conta'], request.form['game'])
            case "inserir_saldo":
                return dbops.inserir_saldo(int(request.form['conta']), float(request.form['cash']))

    
    else: #method GET  
        match request.args.get('operacao'):
            case "historico_transacoes":
                return jsonify(data=dbops.historico_transacoes(request.args.get('conta')), status=200)
            case "ler_saldo":
                return dbops.ler_saldo(request.args.get('conta'))
            case "ler_games": 
                return jsonify(data=dbops.ler_jogos(int(request.args.get('page'))), status=200)
            case "ler_game":
                return jsonify(data=dbops.ler_jogo(int(request.args.get('id_jogo')),int(request.args.get('id_user'))), status=200) 
            case "historico_comentarios":
                return jsonify(data=dbops.historico_comentarios(request.args.get('id_game'),int(request.args.get('page'))), status=200)
            

if __name__ == "__main__": 
    app.run(debug=True, ssl_context=('localhost.crt', 'localhost.key'))
    app.run()
