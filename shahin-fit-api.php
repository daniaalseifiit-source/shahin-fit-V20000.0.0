<?php
/**
 * Plugin Name: Shahin Fit Platform API
 * Description: مدیریت متمرکز دیتابیس و ارتباطات API برای اپلیکیشن شاهین فیت - هماهنگ با نقش‌های ویرایشگر و مشترک.
 * Version: 1.5.0
 * Author: Shahin Fit
 * Text Domain: shahin-fit
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // جلوگیری از دسترسی مستقیم
}

class ShahinFit_API_Handler {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'shahin-fit/v1', '/data', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_app_data' ),
                'permission_callback' => array( $this, 'check_user_auth' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'save_app_data' ),
                'permission_callback' => array( $this, 'check_user_auth' ), // Changed to allow students to save
            ),
        ) );
    }

    // بررسی ورود کاربر
    public function check_user_auth() {
        return is_user_logged_in();
    }

    // بررسی سطح دسترسی مربی (ادمین یا ادیتور)
    public function check_trainer_auth() {
        if ( ! is_user_logged_in() ) return false;
        return current_user_can('editor') || current_user_can('administrator');
    }

    public function get_app_data() {
        $current_user = wp_get_current_user();
        
        $role = 'STUDENT';
        if ( current_user_can('editor') || current_user_can('administrator') ) {
            $role = 'TRAINER';
        }

        // دریافت داده‌ها از دیتابیس وردپرس
        $requests  = get_option( 'shahin_fit_requests', array() );
        $programs  = get_option( 'shahin_fit_programs', array() );
        $exercises = get_option( 'shahin_fit_exercises', array() );

        // اطمینان از آرایه بودن داده‌ها
        if (!is_array($requests)) $requests = array();
        if (!is_array($programs)) $programs = array();
        if (!is_array($exercises)) $exercises = array();

        $user_id_str = 'S' . $current_user->ID;

        // اگر کاربر شاگرد است، فقط اطلاعات مربوط به خودش را ببیند
        if ( $role === 'STUDENT' ) {
            $requests = array_values( array_filter( $requests, function( $req ) use ( $user_id_str ) {
                return isset($req['studentId']) && $req['studentId'] === $user_id_str;
            } ) );
            
            $programs = array_values( array_filter( $programs, function( $prog ) use ( $user_id_str ) {
                return isset($prog['studentId']) && $prog['studentId'] === $user_id_str;
            } ) );
        }

        return new WP_REST_Response( array(
            'role'        => $role,
            'requests'    => $requests,
            'programs'    => $programs,
            'exercises'   => $exercises,
            'currentUser' => array(
                'id'    => $user_id_str,
                'name'  => $current_user->display_name,
                'email' => $current_user->user_email
            )
        ), 200 );
    }

    public function save_app_data( $request ) {
        $current_user = wp_get_current_user();
        if ( ! $current_user->ID ) {
            return new WP_REST_Response( array( 'status' => 'error', 'message' => 'Not logged in' ), 401 );
        }

        $is_trainer = current_user_can('editor') || current_user_can('administrator');
        $params = $request->get_json_params();

        // 1. Handle Requests
        if ( isset( $params['requests'] ) ) {
            $incoming_requests = $params['requests'];
            if ( $is_trainer ) {
                // Trainer overwrites everything (assumes trainer has full dataset)
                update_option( 'shahin_fit_requests', $incoming_requests );
            } else {
                // Student Logic: Merge specific items
                $student_id_str = 'S' . $current_user->ID;
                $existing_requests = get_option( 'shahin_fit_requests', array() );
                if(!is_array($existing_requests)) $existing_requests = array();

                // Map existing for easy update
                $requests_map = array();
                foreach($existing_requests as $r) {
                    if(isset($r['id'])) $requests_map[$r['id']] = $r;
                }

                foreach ($incoming_requests as $inc_req) {
                    // Security: Student can only update their own requests
                    if ( isset($inc_req['studentId']) && $inc_req['studentId'] === $student_id_str ) {
                        $requests_map[$inc_req['id']] = $inc_req;
                    }
                }
                update_option( 'shahin_fit_requests', array_values($requests_map) );
            }
        }

        // 2. Handle Programs (Usually read-only for students, but logic kept for consistency)
        if ( isset( $params['programs'] ) ) {
            $incoming_programs = $params['programs'];
            if ( $is_trainer ) {
                update_option( 'shahin_fit_programs', $incoming_programs );
            } else {
                // Student usually doesn't update programs, but if they do (e.g. read status?), safe merge:
                $student_id_str = 'S' . $current_user->ID;
                $existing_programs = get_option( 'shahin_fit_programs', array() );
                if(!is_array($existing_programs)) $existing_programs = array();

                $programs_map = array();
                foreach($existing_programs as $p) {
                    if(isset($p['id'])) $programs_map[$p['id']] = $p;
                }
                foreach ($incoming_programs as $inc_prog) {
                    if ( isset($inc_prog['studentId']) && $inc_prog['studentId'] === $student_id_str ) {
                        $programs_map[$inc_prog['id']] = $inc_prog;
                    }
                }
                update_option( 'shahin_fit_programs', array_values($programs_map) );
            }
        }

        // 3. Handle Exercises (Trainer Only)
        if ( isset( $params['exercises'] ) && $is_trainer ) {
            update_option( 'shahin_fit_exercises', $params['exercises'] );
        }

        return new WP_REST_Response( array( 
            'status'  => 'success',
            'message' => 'Data saved successfully'
        ), 200 );
    }
}

new ShahinFit_API_Handler();
