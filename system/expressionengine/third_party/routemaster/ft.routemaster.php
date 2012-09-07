<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


/**
 * Composer Framework
 */
class Routemaster_ft extends EE_Fieldtype
{
	var $info = array(
			"name"		=> "Routemaster",
			"version"	=> "0.2"
		);
	var $js;

	static $gmap_loaded = false;

	function __construct()
	{
		parent::__construct();

	}
	

	public function display_field($data)
	{
        $data = unserialize(base64_decode($data));


        if ($this->EE->extensions->active_hook('routemaster_display') === TRUE) {
            $data = $this->EE->extensions->call('routemaster_display', $data);
        }
        
        

        if($data !== FALSE){
            $data = json_encode($data);
        } else {
            $data = "";
        }


		$this->loadJs();
		return "<div class='routemaster_field'>
					<div class=\"map_canvas\" style=\"width: 100%; height: 100%\"></div>
					<textarea name='".$this->field_name."' class=\"map_state\">".$data."</textarea>
				</div>";
	}



    function replace_tag($data, $params = array(), $tagdata = FALSE) {
        static $script_on_page = FALSE;


        $data = unserialize(base64_decode($data));

        if ($this->EE->extensions->active_hook('routemaster_display') === TRUE) {
            $data = $this->EE->extensions->call('routemaster_display', $data);
        }
        
        

        if($data !== FALSE){
            $data = json_encode($data);
        } else {
            $data = "";
        }



        $ret = ""; 

        if(!$script_on_page){

            $ret .= "<link href='".URL_THIRD_THEMES."routemaster/css/styles.css' rel='stylesheet' type='text/javascript'/>
                    <script src=\"http://maps.googleapis.com/maps/api/js?sensor=false\" type='text/javascript'></script>";
            
                $this->EE->requirejs->add("third_party/routemaster/javascript/bootstrap");
                $script_on_page = TRUE;
        }


        // google maps javascript ...

        return $ret."<div class='routemaster_field'><div class=\"map_canvas\" style=\"width: 100%; height: 100%\"></div><textarea readonly class=\"map_state\">".$data."</textarea></div>";
    }




    public function save($data)
    {

        $data = json_decode($data);
        

        if ($this->EE->extensions->active_hook('routemaster_save') === TRUE) {
            $data = $this->EE->extensions->call('routemaster_save', $data);
        }

        
        $data = base64_encode((serialize($data)));
        return $data;
    }




	public function loadJs()
	{

		

		//RequireJS
	
		if(!Routemaster_ft::$gmap_loaded){
            $this->EE->cp->add_to_head("<link href='".URL_THIRD_THEMES."routemaster/css/styles.css' rel='stylesheet' type='text/css'/>");
			$this->EE->cp->add_to_head("<script src=\"http://maps.googleapis.com/maps/api/js?sensor=false\" type='text/javascript'></script>");
			$this->EE->requirejs->add("third_party/routemaster/javascript/bootstrap");
			Routemaster_ft::$gmap_loaded = true;
		}

	
	}
}