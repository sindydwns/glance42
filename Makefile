TARGET = app.zip
SRC = \ 
	$(addprefix ./src/,
	DataBase/*.js \
	models/*.js \
	Routers/*.js \
	Schedule/*.js \
	slack/*.js \
	slack/utils/*.js \
	api42.js \
	apiDataBase.js \
	apiSlack.js \
	app.js \
	constants.js \
	error.js \
	log.js \
	setting.js \
	utils.js
	)
SRCS += package.json

$(TARGET): $(SRC)
	zip -r $@ $^

all: $(TARGET)

fclean:
	rm -rf $(TARGET)

re:	fclean
	make all

.PHONY: all fclean re
