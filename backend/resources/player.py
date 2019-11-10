import datetime
from flask_restful import Resource, reqparse
from bson import json_util
from bson.objectid import ObjectId
from db import mongo

import traceback


class PlayerCreator(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('score',
                        type=int,
                        required=True,
                        help="score field cannot be left blank!"
                        )
    parser.add_argument('name',
                        type=str,
                        required=True,
                        help="Name field cannot be left bank!"
                        )

    def post(self):
        data = PlayerCreator.parser.parse_args()

        # check to see that the given game Id exists
        try:
            game = mongo.db.games.find_one({"_id": ObjectId(data['game_id'])})
        except:
            return {'message': 'An error occured trying to look up this Game'}, 500

        if not game:
            return {'message': 'Game not found. game_id must be a Game that exists.'}, 404

        if game['game_state'] != 'waiting':
            return {'message': 'This Game is no longer allowing Players to join'}, 400

        # create the Player
        try:
            player_id = mongo.db.players.insert_one({
                "name": data['name'],
                "game_id": data['game_id'],
                "points": 0,
            }).inserted_id
            player_created = mongo.db.players.find_one(
                {"_id": player_id})
        except:
            return {'message': 'An error occured inserting the Player'}, 500

        # add the Player to the game
        try:
            game['players'].append(player_created)
            mongo.db.games.update_one({"_id": ObjectId(data['game_id'])}, {
                "$set": {"players": game['players']}})
        except:
            return {'message': 'An error occured trying to update this Game with the new Player'}, 500

        return json_util._json_convert(player_created), 201


class Player(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('points',
                        type=int,
                        required=True,
                        help="required: points to add"
                        )

    def get(self, id):
        player = mongo.db.players.find_one({"_id": ObjectId(id)})
        if player:
            return json_util._json_convert(player), 200
        return {'message': 'Player not found'}, 404

    def put(self, id):
        data = Player.parser.parse_args()
        try:
            player = mongo.db.players.find_one({"_id": ObjectId(id)})
        except:
            return {'message': 'An error occured trying to look up this Player'}, 500

        if not player:
            return {'message': 'Player not found'}, 404

        player['score'] += data['points']

        try:
            mongo.db.players.update_one({"_id": ObjectId(id)}, {
                "$set": {"total_score": player['score']}})
        except:
            return {'message': 'An error occured trying to update this Player with the answer'}, 500

        return json_util._json_convert({"points": data['points']}), 200


class PlayerList(Resource):
    def get(self, game_id):
        try:
            game = mongo.db.games.find_one({"_id": ObjectId(game_id)})
            print(game_id)
        except:
            return {'message': 'An error occured trying to look up this Game'}, 500

        if (game):
            players = mongo.db.players.find({'game_id': game_id})
            if (players):
                return json_util._json_convert(players), 200
        return {'message': 'Game not found'}, 404

    def delete(self, game_id):
        try:
            game = mongo.db.games.find_one({"_id": ObjectId(game_id)})
        except:
            return {'message': 'An error occured trying to look up this Game'}, 500

        if game:
            try:
                mongo.db.players.delete({"game_id": game_id})
            except:
                return {'message': 'An error occured trying to delete Players from this game'}, 500
            return {'message': 'Players were deleted'}, 200
        return {'message': 'Game not found'}, 404
