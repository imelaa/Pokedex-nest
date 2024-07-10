import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Console } from 'console';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
  private readonly pokemonModel: Model<Pokemon>
  ){}


  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name= createPokemonDto.name.toLocaleLowerCase();
  try{
  const pokemon= await this.pokemonModel.create(createPokemonDto);
  
  return pokemon;
  }catch(error){
  this.handleExceptions(error);

  }
  }

  findAll() {
    return ;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;
    //By no
    if(!isNaN(+term)){
      pokemon= await this.pokemonModel.findOne({no:term});
        }
    //By mongo id
    if(!pokemon && isValidObjectId(term)){
      pokemon= await this.pokemonModel.findById(term);
    }
    //By name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:term.toLocaleLowerCase().trim()});
    }
    //If no pokemon
    if (!pokemon) throw new NotFoundException(`Mistatke`);
    return pokemon;
    }


  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    if(updatePokemonDto.name)updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try{

      await pokemon.updateOne(updatePokemonDto,{new:true});
      
      return {...pokemon.toJSON(),...updatePokemonDto};
    }catch(error){
     this.handleExceptions(error);
    }
  }

    async remove(id: string) {
      const {deletedCount} = await this.pokemonModel.deleteOne({_id:id});
      if(deletedCount===0)
        throw new BadRequestException(`Pokemon with id ${id} not found`)
    return true;
   }


  private handleExceptions(error:any){
    if(error.code===11000){
      throw new BadRequestException(`Pokemon exists in db  ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
      throw new InternalServerErrorException(`Error con server`)
  }


}
